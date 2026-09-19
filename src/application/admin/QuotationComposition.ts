import type { Product } from "@/shared/types/product";
import { isVisibleProductStatus } from "@/tenant/config/product/statuses";

export const QUOTATION_DRAFT_VERSION = 1 as const;

export interface QuotationLineSnapshot {
  productId: string;
  title: string;
  imageUrl: string;
  status: string;
  stockSnapshot: number | null;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  subtotal: number;
}
export interface QuotationClient {
  name: string;
  whatsapp: string;
  document: string;
}

export interface QuotationConditions {
  issueDate: string;
  validityDays: number;
  notes: string;
}

export interface QuotationDraft {
  version: typeof QUOTATION_DRAFT_VERSION;
  id: string;
  createdAt: string;
  updatedAt: string;
  client: QuotationClient;
  conditions: QuotationConditions;
  lines: QuotationLineSnapshot[];
}

export interface QuotationTotals {
  lineCount: number;
  totalUnits: number;
  total: number;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function sanitizeQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.trunc(value));
}

function sanitizePrice(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return roundCurrency(Math.max(0, value));
}

function getLocalDate(now: Date): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDraftId(now: Date): string {
  const compactDate = getLocalDate(now).replaceAll("-", "");
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
    .map((value) => String(value).padStart(2, "0"))
    .join("");
  return `GLQ-${compactDate}-${time}-${String(now.getMilliseconds()).padStart(3, "0")}`;
}

export function createQuotationLine(product: Product): QuotationLineSnapshot {
  const activePrice =
    product.offer_price && product.offer_price > 0
      ? product.offer_price
      : product.price;
  const unitPrice = sanitizePrice(activePrice);

  return {
    productId: product.id,
    title: product.title,
    imageUrl: product.img,
    status: product.status,
    stockSnapshot: product.stock,
    quantity: 1,
    unitPrice,
    originalUnitPrice: sanitizePrice(product.price),
    subtotal: unitPrice,
  };
}

export function createQuotationDraft(
  products: readonly Product[],
  selectedProductIds: readonly string[],
  now = new Date(),
): QuotationDraft {
  const selectedIds = new Set(selectedProductIds);
  const timestamp = now.toISOString();

  return {
    version: QUOTATION_DRAFT_VERSION,
    id: createDraftId(now),
    createdAt: timestamp,
    updatedAt: timestamp,
    client: { name: "", whatsapp: "", document: "" },
    conditions: {
      issueDate: getLocalDate(now),
      validityDays: 3,
      notes: "",
    },
    lines: products
      .filter(
        (product) =>
          selectedIds.has(product.id) && isVisibleProductStatus(product.status),
      )
      .map(createQuotationLine),
  };
}

export function updateQuotationLine(
  line: QuotationLineSnapshot,
  patch: Partial<Pick<QuotationLineSnapshot, "quantity" | "unitPrice">>,
): QuotationLineSnapshot {
  const quantity = sanitizeQuantity(patch.quantity ?? line.quantity);
  const unitPrice = sanitizePrice(patch.unitPrice ?? line.unitPrice);

  return {
    ...line,
    quantity,
    unitPrice,
    subtotal: roundCurrency(quantity * unitPrice),
  };
}

export function getQuotationTotals(
  lines: readonly QuotationLineSnapshot[],
): QuotationTotals {
  return {
    lineCount: lines.length,
    totalUnits: lines.reduce((total, line) => total + line.quantity, 0),
    total: roundCurrency(
      lines.reduce((total, line) => total + line.subtotal, 0),
    ),
  };
}

export function isQuotationReady(draft: QuotationDraft): boolean {
  return Boolean(
    draft.lines.length > 0 &&
      draft.client.name.trim() &&
      draft.client.whatsapp.trim(),
  );
}

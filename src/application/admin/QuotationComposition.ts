import type { Product } from "@/shared/types/product";
import { isVisibleProductStatus } from "@/tenant/config/product/statuses";

export const QUOTATION_DRAFT_VERSION = 1 as const;

export interface QuotationLineSnapshot {
  lineId: string;
  productId: string;
  productCode: string;
  productName: string;
  title: string;
  imageUrl: string;
  status: string;
  stockSnapshot: number | null;
  quantity: number;
  baseUnitPrice: number;
  quotedUnitPrice: number;
  /** @deprecated Compatibility with v1 local drafts. */
  unitPrice: number;
  /** @deprecated Compatibility with v1 local drafts. */
  originalUnitPrice: number;
}
export interface QuotationClient {
  name: string;
  whatsapp: string;
  documentType?: "DNI" | "RUC" | "Otro" | "";
  documentNumber?: string;
  /** @deprecated Compatibility with v1 local drafts. */
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
  quotationId: string;
  quotationNumber?: string;
  revision: number;
  status: "draft";
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

export type QuotationLifecycleStatus =
  | "draft" | "ready" | "sent" | "accepted" | "rejected"
  | "expired" | "cancelled" | "converted";

export interface QuotationSnapshot extends Omit<QuotationDraft, "status"> {
  quotationVersionId: string;
  status: "ready";
  snapshotAt: string;
  totals: QuotationTotals;
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
    lineId: `line:${product.id}`,
    productId: product.id,
    productCode: product.id,
    productName: product.title,
    title: product.title,
    imageUrl: product.img,
    status: product.status,
    stockSnapshot: product.stock,
    quantity: 1,
    baseUnitPrice: sanitizePrice(product.price),
    quotedUnitPrice: unitPrice,
    unitPrice,
    originalUnitPrice: sanitizePrice(product.price),
  };
}

export function createQuotationDraft(
  products: readonly Product[],
  selectedProductIds: readonly string[],
  now = new Date(),
): QuotationDraft {
  const selectedIds = new Set(selectedProductIds);
  const timestamp = now.toISOString();

  const quotationId = createDraftId(now);
  return {
    version: QUOTATION_DRAFT_VERSION,
    id: quotationId,
    quotationId,
    revision: 1,
    status: "draft",
    createdAt: timestamp,
    updatedAt: timestamp,
    client: { name: "", whatsapp: "", documentType: "", documentNumber: "", document: "" },
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
  patch: Partial<Pick<QuotationLineSnapshot, "quantity" | "quotedUnitPrice" | "unitPrice">>,
): QuotationLineSnapshot {
  const quantity = sanitizeQuantity(patch.quantity ?? line.quantity);
  const unitPrice = sanitizePrice(
    patch.quotedUnitPrice ?? patch.unitPrice ?? line.quotedUnitPrice ?? line.unitPrice,
  );

  return {
    ...line,
    quantity,
    quotedUnitPrice: unitPrice,
    unitPrice,
  };
}

export function getQuotationLineSubtotal(line: QuotationLineSnapshot): number {
  const quantity = sanitizeQuantity(line.quantity);
  const unitPriceCents = Math.round(sanitizePrice(line.quotedUnitPrice ?? line.unitPrice) * 100);
  return (quantity * unitPriceCents) / 100;
}

export function getQuotationTotals(
  lines: readonly QuotationLineSnapshot[],
): QuotationTotals {
  return {
    lineCount: lines.length,
    totalUnits: lines.reduce((total, line) => total + line.quantity, 0),
    total: roundCurrency(
      lines.reduce((total, line) => total + getQuotationLineSubtotal(line), 0),
    ),
  };
}

export function getQuotationValidUntil(conditions: QuotationConditions): string {
  const [year, month, day] = conditions.issueDate.split("-").map(Number);
  if (!year || !month || !day) return "";
  const result = new Date(Date.UTC(year, month - 1, day));
  result.setUTCDate(result.getUTCDate() + sanitizeQuantity(conditions.validityDays));
  return result.toISOString().slice(0, 10);
}

export function normalizeQuotationWhatsapp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 9) return `51${digits}`;
  return digits;
}

export function createQuotationSnapshot(
  draft: QuotationDraft,
  snapshotAt = new Date(),
): QuotationSnapshot {
  return {
    ...draft,
    quotationVersionId: `${draft.quotationId}:revision:${draft.revision}`,
    status: "ready",
    client: { ...draft.client, whatsapp: normalizeQuotationWhatsapp(draft.client.whatsapp) },
    conditions: { ...draft.conditions },
    lines: draft.lines.map((line) => ({ ...line })),
    snapshotAt: snapshotAt.toISOString(),
    totals: getQuotationTotals(draft.lines),
  };
}

export function isQuotationReady(draft: QuotationDraft): boolean {
  const whatsappDigits = normalizeQuotationWhatsapp(draft.client.whatsapp);
  return Boolean(
    draft.lines.length > 0 &&
      draft.client.name.trim() &&
      whatsappDigits.length >= 8 &&
      whatsappDigits.length <= 15,
  );
}

import {
  QUOTATION_DRAFT_VERSION,
  type QuotationDraft,
} from "@/application/admin/QuotationComposition";

const STORAGE_KEY = "gleemour.admin.quotation-drafts.v1";
const MAX_DRAFTS = 20;

interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}
export interface QuotationDraftRepository {
  listDrafts(): QuotationDraft[];
  getDraft(quotationId: string): QuotationDraft | null;
  saveDraft(draft: QuotationDraft): QuotationDraft[];
  deleteDraft(quotationId: string): QuotationDraft[];
}

/** @deprecated Use QuotationDraftRepository methods. */
export interface QuotationDraftStore extends QuotationDraftRepository {
  list(): QuotationDraft[];
  save(draft: QuotationDraft): QuotationDraft[];
}

function isQuotationDraft(value: unknown): value is QuotationDraft {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<QuotationDraft>;
  return Boolean(
    candidate.version === QUOTATION_DRAFT_VERSION &&
      typeof candidate.id === "string" &&
      typeof candidate.createdAt === "string" &&
      typeof candidate.updatedAt === "string" &&
      candidate.client &&
      candidate.conditions &&
      Array.isArray(candidate.lines),
  );
}

function normalizeDraft(draft: QuotationDraft): QuotationDraft {
  return {
    ...draft,
    quotationId: draft.quotationId ?? draft.id,
    revision: draft.revision ?? 1,
    status: "draft",
    client: {
      ...draft.client,
      documentType: draft.client.documentType ?? "",
      documentNumber: draft.client.documentNumber ?? draft.client.document ?? "",
    },
    lines: draft.lines.map((line) => ({
      ...line,
      lineId: line.lineId ?? `line:${line.productId}`,
      productCode: line.productCode ?? line.productId,
      productName: line.productName ?? line.title,
      baseUnitPrice: line.baseUnitPrice ?? line.originalUnitPrice,
      quotedUnitPrice: line.quotedUnitPrice ?? line.unitPrice,
    })),
  };
}

export function createLocalQuotationDraftRepository(
  storage: DraftStorage,
): QuotationDraftStore {
  const listDrafts = (): QuotationDraft[] => {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(isQuotationDraft)
        .map(normalizeDraft)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    } catch {
      return [];
    }
  };

  const saveDraft = (draft: QuotationDraft): QuotationDraft[] => {
    const nextDrafts = [draft, ...listDrafts().filter((item) => item.id !== draft.id)]
      .slice(0, MAX_DRAFTS);

    storage.setItem(STORAGE_KEY, JSON.stringify(nextDrafts));
    return nextDrafts;
  };

  const getDraft = (quotationId: string) =>
    listDrafts().find(
      (draft) => draft.quotationId === quotationId || draft.id === quotationId,
    ) ?? null;

  const deleteDraft = (quotationId: string): QuotationDraft[] => {
    const nextDrafts = listDrafts().filter(
      (draft) => draft.quotationId !== quotationId && draft.id !== quotationId,
    );
    storage.setItem(STORAGE_KEY, JSON.stringify(nextDrafts));
    return nextDrafts;
  };

  return {
    listDrafts,
    getDraft,
    saveDraft,
    deleteDraft,
    list: listDrafts,
    save: saveDraft,
  };
}

/** Compatibility factory for existing consumers. */
export const createQuotationDraftStore = createLocalQuotationDraftRepository;

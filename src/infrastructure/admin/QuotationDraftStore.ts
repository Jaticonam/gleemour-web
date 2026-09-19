import {
  QUOTATION_DRAFT_VERSION,
  type QuotationDraft,
} from "@/application/admin/QuotationComposition";

const STORAGE_KEY = "gleemour.admin.quotation-drafts.v1";
const MAX_DRAFTS = 20;

interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface QuotationDraftStore {
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

export function createQuotationDraftStore(
  storage: DraftStorage,
): QuotationDraftStore {
  const list = (): QuotationDraft[] => {
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter(isQuotationDraft)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
    } catch {
      return [];
    }
  };

  const save = (draft: QuotationDraft): QuotationDraft[] => {
    const nextDrafts = [draft, ...list().filter((item) => item.id !== draft.id)]
      .slice(0, MAX_DRAFTS);

    storage.setItem(STORAGE_KEY, JSON.stringify(nextDrafts));
    return nextDrafts;
  };

  return { list, save };
}

import { describe, expect, it } from "vitest";

import { createQuotationDraft } from "@/application/admin/QuotationComposition";

import { createQuotationDraftStore } from "./QuotationDraftStore";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("QuotationDraftStore", () => {
  it("guarda, actualiza y ordena borradores versionados", () => {
    const store = createQuotationDraftStore(memoryStorage());
    const first = createQuotationDraft([], [], new Date("2026-09-19T10:00:00Z"));
    const second = createQuotationDraft([], [], new Date("2026-09-19T11:00:00Z"));

    store.save(first);
    store.save(second);
    store.save({ ...first, updatedAt: "2026-09-19T12:00:00.000Z" });

    expect(store.list().map(({ id }) => id)).toEqual([first.id, second.id]);
  });

  it("falla cerrado ante contenido inválido", () => {
    const storage = memoryStorage();
    storage.setItem("gleemour.admin.quotation-drafts.v1", "{inválido");

    expect(createQuotationDraftStore(storage).list()).toEqual([]);
  });
});

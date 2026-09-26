import { describe, expect, it } from "vitest";

import type { Product } from "@/shared/types/product";

import {
  createQuotationDraft,
  createQuotationSnapshot,
  getQuotationLineSubtotal,
  getQuotationValidUntil,
  getQuotationTotals,
  isQuotationReady,
  updateQuotationLine,
} from "./QuotationComposition";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "GLE-001",
    title: "Ramo Aurora",
    description: "Rosas premium",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: [],
    campaigns: [],
    price: 120,
    offer_price: 99.9,
    stock: 3,
    img: "aurora.jpg",
    images: [],
    priority: 10,
    status: "Publicado",
    badges: [],
    attributes: [],
    addons: [],
    music: [],
    ...overrides,
  };
}

describe("QuotationComposition", () => {
  it("crea snapshots solo para productos seleccionados y visibles", () => {
    const draft = createQuotationDraft(
      [
        product(),
        product({ id: "GLE-002", title: "Interno", status: "Borrador" }),
        product({ id: "GLE-003", title: "Sorpresa", offer_price: null }),
      ],
      ["GLE-001", "GLE-002"],
      new Date(2026, 8, 19, 10, 30, 5, 12),
    );

    expect(draft.id).toBe("GLQ-20260919-103005-012");
    expect(draft.lines).toHaveLength(1);
    expect(draft.lines[0]).toMatchObject({
      productId: "GLE-001",
      quantity: 1,
      unitPrice: 99.9,
      originalUnitPrice: 120,
      quotedUnitPrice: 99.9,
      baseUnitPrice: 120,
      productCode: "GLE-001",
      productName: "Ramo Aurora",
      stockSnapshot: 3,
    });
  });

  it("normaliza cantidades y precios y recalcula subtotales", () => {
    const draft = createQuotationDraft([product()], ["GLE-001"]);
    const updated = updateQuotationLine(draft.lines[0], {
      quantity: 2.8,
      quotedUnitPrice: 88.555,
    });

    expect(updated.quantity).toBe(2);
    expect(updated.unitPrice).toBe(88.56);
    expect(getQuotationLineSubtotal(updated)).toBe(177.12);
  });

  it("deriva vencimiento y congela un snapshot trazable", () => {
    const draft = createQuotationDraft([product()], ["GLE-001"], new Date("2026-09-25T12:00:00Z"));
    draft.client = { name: "Cliente Demo", whatsapp: "00000000", document: "" };
    expect(getQuotationValidUntil(draft.conditions)).toBe("2026-09-28");

    const snapshot = createQuotationSnapshot(draft, new Date("2026-09-25T13:00:00Z"));
    expect(snapshot.status).toBe("ready");
    expect(snapshot.quotationVersionId).toBe(`${draft.quotationId}:revision:1`);
    expect(snapshot.client.whatsapp).toBe("00000000");
    expect(snapshot.totals.total).toBe(99.9);

    const source = product();
    source.title = "Producto renombrado";
    source.price = 999;
    expect(snapshot.lines[0].productName).toBe("Ramo Aurora");
    expect(snapshot.lines[0].quotedUnitPrice).toBe(99.9);
  });

  it("calcula totales y valida datos mínimos del cliente", () => {
    const draft = createQuotationDraft(
      [product(), product({ id: "GLE-002", price: 50, offer_price: null })],
      ["GLE-001", "GLE-002"],
    );
    draft.lines[0] = updateQuotationLine(draft.lines[0], { quantity: 2 });

    expect(getQuotationTotals(draft.lines)).toEqual({
      lineCount: 2,
      totalUnits: 3,
      total: 249.8,
    });
    expect(isQuotationReady(draft)).toBe(false);

    draft.client = { name: "Cliente Demo", whatsapp: "00000000", document: "" };
    expect(isQuotationReady(draft)).toBe(true);

    draft.client.whatsapp = "123";
    expect(isQuotationReady(draft)).toBe(false);
  });
});

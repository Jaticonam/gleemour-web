import { describe, expect, it } from "vitest";

import type { Product } from "@/shared/types/product";

import {
  createCatalogCompositionDraft,
  moveProduct,
  resolveCatalogComposition,
  toCatalogDraftContract,
} from "./CatalogComposition";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "GLE-001",
    title: "Ramo Aurora",
    description: "Ramo premium",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: ["te-elijo-hoy"],
    campaigns: ["san-valentin"],
    price: 120,
    offer_price: null,
    stock: 3,
    img: "",
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

const PRODUCTS = [
  product(),
  product({
    id: "GLE-002",
    title: "Box Corazón",
    category: "para-sorprender",
    categories: ["para-sorprender", "para-enamorar"],
    subcategories: ["pense-en-ti"],
    campaigns: ["dia-de-la-novia"],
    priority: 20,
    price: 80,
  }),
  product({ id: "GLE-003", status: "Borrador", priority: 30 }),
];

describe("CatalogComposition", () => {
  it("resuelve una categoría y separa productos no publicables", () => {
    const draft = {
      ...createCatalogCompositionDraft(),
      mode: "category" as const,
      categoryId: "para-enamorar",
    };

    const result = resolveCatalogComposition(PRODUCTS, draft);

    expect(result.candidates.map(({ id }) => id)).toEqual([
      "GLE-001",
      "GLE-002",
      "GLE-003",
    ]);
    expect(result.included.map(({ id }) => id)).toEqual(["GLE-002", "GLE-001"]);
    expect(result.excluded.map(({ id }) => id)).toEqual(["GLE-003"]);
  });

  it("aplica exclusiones manuales reversibles sin alterar la fuente", () => {
    const draft = createCatalogCompositionDraft();
    draft.manuallyExcludedProductIds = ["GLE-002"];

    const excluded = resolveCatalogComposition(PRODUCTS, draft);
    expect(excluded.candidates.map(({ id }) => id)).toEqual([
      "GLE-001",
      "GLE-002",
      "GLE-003",
    ]);
    expect(excluded.manuallyExcluded.map(({ id }) => id)).toEqual(["GLE-002"]);

    draft.manuallyExcludedProductIds = [];
    expect(resolveCatalogComposition(PRODUCTS, draft).included.map(({ id }) => id))
      .toEqual(["GLE-002", "GLE-001"]);
  });

  it("ordena globalmente por nombre y precio", () => {
    const draft = createCatalogCompositionDraft();
    draft.sortMode = "name-asc";
    expect(resolveCatalogComposition(PRODUCTS, draft).included.map(({ id }) => id))
      .toEqual(["GLE-002", "GLE-001"]);

    draft.sortMode = "price-desc";
    expect(resolveCatalogComposition(PRODUCTS, draft).included.map(({ id }) => id))
      .toEqual(["GLE-001", "GLE-002"]);
  });

  it("crea una selección personalizada sin duplicados", () => {
    const draft = createCatalogCompositionDraft([
      "GLE-002",
      "GLE-001",
      "GLE-002",
    ]);
    draft.orderedProductIds = ["GLE-001", "GLE-002"];

    const result = resolveCatalogComposition(PRODUCTS, draft);

    expect(draft.mode).toBe("custom");
    expect(draft.customProductIds).toEqual(["GLE-002", "GLE-001"]);
    expect(result.included.map(({ id }) => id)).toEqual(["GLE-001", "GLE-002"]);
  });

  it("respeta la identidad categoría + subcategoría", () => {
    const draft = {
      ...createCatalogCompositionDraft(),
      mode: "subcategory" as const,
      categoryId: "para-enamorar",
      subcategoryId: "te-elijo-hoy",
    };

    const result = resolveCatalogComposition(PRODUCTS, draft);

    expect(result.included.map(({ id }) => id)).toEqual(["GLE-001"]);
  });

  it("resuelve productos relacionados con una campaña", () => {
    const draft = {
      ...createCatalogCompositionDraft(),
      mode: "campaign" as const,
      campaignId: "dia-de-la-novia",
    };

    const result = resolveCatalogComposition(PRODUCTS, draft);

    expect(result.included.map(({ id }) => id)).toEqual(["GLE-002"]);
  });

  it("mueve productos sin salir de los límites", () => {
    expect(moveProduct(["A", "B", "C"], "B", "up")).toEqual(["B", "A", "C"]);
    expect(moveProduct(["A", "B", "C"], "C", "down")).toEqual(["A", "B", "C"]);
  });

  it("expone un contrato draft neutral para JUNG CORE", () => {
    const draft = createCatalogCompositionDraft(["GLE-001", "GLE-002"]);
    draft.settings.title = "Selección comercial";
    draft.manuallyExcludedProductIds = ["GLE-002"];

    const contract = toCatalogDraftContract(
      draft,
      resolveCatalogComposition(PRODUCTS, draft),
    );

    expect(contract).toMatchObject({
      status: "draft",
      compositionStrategy: "dynamic",
      source: { type: "manual", productIds: ["GLE-001", "GLE-002"] },
      composition: {
        productIds: ["GLE-001"],
        excludedProductIds: ["GLE-002"],
        order: ["GLE-001"],
      },
      settings: { title: "Selección comercial" },
    });
  });
});

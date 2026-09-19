import { describe, expect, it } from "vitest";

import type { Product } from "@/shared/types/product";

import {
  createCatalogCompositionDraft,
  moveProduct,
  resolveCatalogComposition,
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
    category: "para-sorprender",
    categories: ["para-sorprender", "para-enamorar"],
    subcategories: ["pense-en-ti"],
    campaigns: ["dia-de-la-novia"],
    priority: 20,
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
});

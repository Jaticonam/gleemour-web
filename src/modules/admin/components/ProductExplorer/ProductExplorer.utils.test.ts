import { describe, expect, it } from "vitest";

import type { Product } from "@/shared/types/product";

import {
  ALL_ADMIN_FILTERS,
  filterAdminProducts,
  getAdminStatusClassName,
  getProductExplorerStats,
} from "./ProductExplorer.utils";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "GLE-001",
    title: "Ramo Corazón",
    description: "Rosas premium",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: [],
    campaigns: [],
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

describe("ProductExplorer utils", () => {
  const products = [
    product(),
    product({
      id: "GLE-002",
      title: "Box Sorpresa",
      category: "para-sorprender",
      categories: ["para-sorprender"],
      status: "Borrador",
      stock: null,
    }),
    product({
      id: "GLE-003",
      title: "Ramo agotado",
      status: "Agotado",
      stock: 0,
    }),
  ];

  it("combina búsqueda, estado y categoría", () => {
    expect(
      filterAdminProducts(products, {
        query: "sorpresa",
        status: "Borrador",
        category: "para-sorprender",
      }).map((item) => item.id),
    ).toEqual(["GLE-002"]);
  });

  it("busca ignorando mayúsculas y acentos", () => {
    expect(
      filterAdminProducts(products, {
        query: "corazon",
        status: ALL_ADMIN_FILTERS,
        category: ALL_ADMIN_FILTERS,
      }).map((item) => item.id),
    ).toEqual(["GLE-001"]);
  });

  it("calcula métricas operativas sin duplicar agotados", () => {
    expect(getProductExplorerStats(products)).toEqual({
      total: 3,
      published: 1,
      preparation: 1,
      withoutStock: 1,
    });
  });

  it("convierte estados en modificadores CSS seguros", () => {
    expect(getAdminStatusClassName("Sin estado")).toBe("sin-estado");
  });
});

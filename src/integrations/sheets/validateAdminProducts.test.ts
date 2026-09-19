import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/shared/types/product";

import { validateAdminProducts } from "./validateAdminProducts";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "GLE-001",
    title: "Ramo Gleemour",
    description: "Detalle especial",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: [],
    campaigns: [],
    price: 99,
    offer_price: null,
    stock: 4,
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

describe("validateAdminProducts", () => {
  it("conserva estados que el catálogo público no expone", () => {
    const result = validateAdminProducts([
      product({ id: "GLE-001", status: "Publicado" }),
      product({ id: "GLE-002", status: "Oculto" }),
      product({ id: "GLE-003", status: "Borrador" }),
    ]);

    expect(result.map((item) => item.status)).toEqual([
      "Publicado",
      "Oculto",
      "Borrador",
    ]);
  });

  it("descarta registros sin identidad y códigos duplicados", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = validateAdminProducts([
      product(),
      product({ title: "Duplicado" }),
      product({ id: "", title: "Sin código" }),
      product({ id: "GLE-004", title: "" }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("GLE-001");
    expect(warn).toHaveBeenCalledTimes(3);

    warn.mockRestore();
  });
});

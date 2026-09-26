import { describe, expect, it } from "vitest";

import type { Product } from "@/shared/types/product";

import { formatProductField, PRODUCT_FIELDS, sortProducts } from "./ProductExplorer.fields";

const product = (id: string, title: string, price: number, stock: number): Product => ({
  id, title, price, stock, description: "", category: "para-enamorar",
  categories: ["para-enamorar"], subcategories: [], campaigns: [], offer_price: null,
  img: "", images: [], priority: 1, status: "Publicado", badges: [], attributes: [], addons: [], music: [],
});

describe("Product field registry", () => {
  it("ordena con una definición compartida y conserva el dataset original", () => {
    const source = [product("B", "Beta", 20, 1), product("A", "Alfa", 10, 4)];
    expect(sortProducts(source, { field: "price", direction: "asc" }).map((item) => item.id)).toEqual(["A", "B"]);
    expect(source.map((item) => item.id)).toEqual(["B", "A"]);
  });

  it("formatea arrays y ausencia de fecha sin inventar datos", () => {
    const item = { ...product("A", "Alfa", 10, 4), badges: ["Nuevo", "Premium", "Oferta"] };
    expect(formatProductField(item, PRODUCT_FIELDS.find((field) => field.key === "badges")!)).toBe("Nuevo, Premium +1");
    expect(formatProductField(item, PRODUCT_FIELDS.find((field) => field.key === "updated_at")!)).toBe("Sin fecha");
  });
});

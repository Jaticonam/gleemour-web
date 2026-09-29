import { describe, expect, it } from "vitest";
import type { Product } from "@/shared/types/product";
import {
  filterCatalogProducts,
  getAvailableDiscoverOptions,
  matchesDiscover,
  type CatalogFilterState,
} from "./CatalogFilters";

function product(id: string, overrides: Partial<Product> = {}): Product {
  return {
    id, title: id, description: "Rosas frescas", category: "para-enamorar",
    categories: ["para-enamorar"], subcategories: [], campaigns: [],
    price: 100, offer_price: null, stock: 20, img: "", priority: 0,
    status: "Publicado", badges: [], attributes: [], addons: [],
    ...overrides,
  };
}

const products = [
  product("PREMIUM-ROSA", { title: "Rosas premium", badges: ["Premium"], campaigns: ["dia-madre"] }),
  product("PREMIUM-OTRA", { title: "Otro detalle", category: "para-celebrar", attributes: ["premium"] }),
  product("NUEVO", { title: "Rosas nuevas", badges: ["Nuevo"], campaigns: ["dia-madre"] }),
  product("ULTIMOS", { stock: 2, badges: ["Últimas unidades"] }),
  product("POCAS", { stock: 8 }),
  product("AGOTADO", { stock: 0, status: "Agotado" }),
];

const defaults: CatalogFilterState = {
  searchQuery: "", activeCampaign: "", activeCategory: "todas", activeDiscover: "",
};

describe("descubrimiento comercial", () => {
  it("solo ofrece criterios presentes en datos explícitos o stock real", () => {
    expect(getAvailableDiscoverOptions(products).map((item) => item.id))
      .toEqual(["nuevo", "premium", "last-units"]);
    expect(getAvailableDiscoverOptions([product("SIN-METADATA")])).toEqual([]);
    expect(matchesDiscover(product("CARO", { price: 9999, priority: 100 }), "premium")).toBe(false);
    expect(matchesDiscover(products[4], "last-units")).toBe(false);
    expect(matchesDiscover(products[5], "last-units")).toBe(false);
  });

  it("combina categoría, campaña, búsqueda y Premium sin alterar orden", () => {
    expect(filterCatalogProducts(products, {
      searchQuery: "rosas", activeCampaign: "Día de la Madre",
      activeCategory: "para-enamorar", activeDiscover: "premium",
    }).map((item) => item.id)).toEqual(["PREMIUM-ROSA"]);
  });

  it("combina Nuevos con campaña y Últimas unidades con categoría", () => {
    expect(filterCatalogProducts(products, {
      ...defaults, activeCampaign: "dia-madre", activeDiscover: "nuevo",
    }).map((item) => item.id)).toEqual(["NUEVO"]);
    expect(filterCatalogProducts(products, {
      ...defaults, activeCategory: "para-enamorar", activeDiscover: "last-units",
    }).map((item) => item.id)).toEqual(["ULTIMOS"]);
  });

  it("permite limpiar solo Descubre y devuelve vacío ante combinaciones sin resultados", () => {
    expect(filterCatalogProducts(products, {
      ...defaults, activeCategory: "para-celebrar", activeDiscover: "nuevo",
    })).toEqual([]);
    expect(filterCatalogProducts(products, {
      ...defaults, activeCategory: "para-celebrar",
    }).map((item) => item.id)).toEqual(["PREMIUM-OTRA"]);
  });
});

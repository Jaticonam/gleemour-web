import { describe, expect, it, vi } from "vitest";

import type { CatalogSubcategory } from "@/shared/types/product";

import { validateSubcategories } from "./validateSubcategories";

function createSubcategory(
  overrides: Partial<CatalogSubcategory> = {},
): CatalogSubcategory {
  return {
    id: "amor-distancia",
    categoryId: "para-enamorar",
    name: "Amor a distancia",
    icon: "💌",
    description: "",
    priority: 100,
    status: "Publicado",
    ...overrides,
  };
}

describe("validateSubcategories", () => {
  it("descarta categorías desconocidas y la categoría virtual todas", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = validateSubcategories([
      createSubcategory({
        id: "desconocida",
        categoryId: "categoria-inexistente",
      }),
      createSubcategory({
        id: "virtual",
        categoryId: "todas",
      }),
      createSubcategory(),
    ]);

    expect(result.map((subcategory) => subcategory.id)).toEqual([
      "amor-distancia",
    ]);

    vi.restoreAllMocks();
  });

  it("descarta claves duplicadas dentro de la misma categoría", () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = validateSubcategories([
      createSubcategory({
        id: "AMOR-DISTANCIA",
        name: "Primera versión",
      }),
      createSubcategory({
        id: "amor-distancia",
        name: "Versión duplicada",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Primera versión");

    vi.restoreAllMocks();
  });

  it("permite el mismo id en categorías diferentes", () => {
    const result = validateSubcategories([
      createSubcategory({
        id: "primer-detalle",
        categoryId: "para-enamorar",
        name: "Primer detalle",
      }),
      createSubcategory({
        id: "primer-detalle",
        categoryId: "para-sorprender",
        name: "Primer detalle",
      }),
    ]);

    expect(result).toHaveLength(2);
    expect(
      result.map((subcategory) => subcategory.categoryId),
    ).toEqual(
      expect.arrayContaining([
        "para-enamorar",
        "para-sorprender",
      ]),
    );
  });

  it("descarta estados no publicados", () => {
    const result = validateSubcategories([
      createSubcategory({
        id: "oculta",
        status: "Oculto",
      }),
      createSubcategory(),
    ]);

    expect(result.map((subcategory) => subcategory.id)).toEqual([
      "amor-distancia",
    ]);
  });

  it("ordena por prioridad descendente y luego por nombre", () => {
    const result = validateSubcategories([
      createSubcategory({
        id: "cumpleanos",
        categoryId: "para-celebrar",
        name: "Cumpleaños",
        priority: 50,
      }),
      createSubcategory({
        id: "aniversario",
        categoryId: "momentos-especiales",
        name: "Aniversario",
        priority: 50,
      }),
      createSubcategory({
        id: "primer-detalle",
        name: "Primer detalle",
        priority: 90,
      }),
    ]);

    expect(result.map((subcategory) => subcategory.id)).toEqual([
      "primer-detalle",
      "aniversario",
      "cumpleanos",
    ]);
  });
});
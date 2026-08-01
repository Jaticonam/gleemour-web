import { describe, expect, it } from "vitest";

import { normalizeProduct } from "./normalizeProduct";

describe("normalizeProduct subcategories", () => {
  it("convierte products.subcategory separado por pipe en un arreglo", () => {
    const product = normalizeProduct({
      subcategory: "Amor a distancia|Primer detalle",
    });

    expect(product.subcategories).toEqual([
      "Amor a distancia",
      "Primer detalle",
    ]);
  });

  it("recorta espacios, descarta vacíos y elimina duplicados", () => {
    const product = normalizeProduct({
      subcategory:
        "  Amor a distancia  ||Primer detalle|amor a distancia|  ",
    });

    expect(product.subcategories).toEqual([
      "Amor a distancia",
      "Primer detalle",
    ]);
  });

  it("considera iguales los duplicados con diferencias de acentos y mayúsculas", () => {
    const product = normalizeProduct({
      subcategory: "Cumpleaños|cumpleanos|Inauguración",
    });

    expect(product.subcategories).toEqual([
      "Cumpleaños",
      "Inauguración",
    ]);
  });

  it("devuelve un arreglo vacío cuando el campo está vacío", () => {
    const product = normalizeProduct({
      subcategory: "",
    });

    expect(product.subcategories).toEqual([]);
  });

  it("devuelve un arreglo vacío cuando el campo no existe", () => {
    const product = normalizeProduct({});

    expect(product.subcategories).toEqual([]);
  });
});
import { describe, expect, it } from "vitest";

import type { Addon } from "@/shared/types/product";

import {
  canOpenExperienceAddons,
  clearExperienceAddonSelection,
  getExperienceAddonsTotal,
  getExperienceSelectedAddons,
  getExperienceTotal,
  isExperienceAddonAllowed,
  syncExperienceAddonSelection,
  toggleExperienceAddonSelection,
  type ExperienceAddonSelection,
} from "./addons.utils";

const chocolate: Addon = {
  id: "ADD01",
  title: "Chocolate Ferrero",
  price: 15,
  img: "/chocolate.webp",
  category: "chocolates",
  status: "Publicado",
  priority: 20,
};

const balloon: Addon = {
  id: "Globo_Corazón",
  title: "Globo corazón",
  price: 10,
  img: "/globo.webp",
  category: "globos",
  status: "Publicado",
  priority: 10,
};

const emptySelection: ExperienceAddonSelection = {
  productId: "",
  addons: [],
};

describe("Experience addons utilities", () => {
  it("mantiene la selección mientras el producto no cambia", () => {
    const selection = toggleExperienceAddonSelection(
      emptySelection,
      "GLEE001",
      chocolate,
    );

    expect(
      getExperienceSelectedAddons(selection, "GLEE001"),
    ).toEqual([chocolate]);

    expect(
      getExperienceSelectedAddons(selection, "glee001"),
    ).toEqual([chocolate]);
  });

  it("limpia la selección apenas cambia el producto principal", () => {
    const selection = toggleExperienceAddonSelection(
      emptySelection,
      "GLEE001",
      chocolate,
    );

    const changedProduct = syncExperienceAddonSelection(
      selection,
      "GLEE002",
    );

    expect(changedProduct).toEqual({
      productId: "glee002",
      addons: [],
    });

    expect(
      syncExperienceAddonSelection(selection, "GLEE001"),
    ).toBe(selection);
  });

  it("retira un complemento al volver a seleccionarlo", () => {
    const selected = toggleExperienceAddonSelection(
      emptySelection,
      "GLEE001",
      chocolate,
    );

    const removed = toggleExperienceAddonSelection(
      selected,
      "GLEE001",
      chocolate,
    );

    expect(removed).toEqual({
      productId: "glee001",
      addons: [],
    });
  });

  it("descarta complementos anteriores al cambiar de producto", () => {
    const firstProductSelection =
      toggleExperienceAddonSelection(
        emptySelection,
        "GLEE001",
        chocolate,
      );

    const secondProductSelection =
      toggleExperienceAddonSelection(
        firstProductSelection,
        "GLEE002",
        balloon,
      );

    expect(secondProductSelection).toEqual({
      productId: "glee002",
      addons: [balloon],
    });

    expect(
      getExperienceSelectedAddons(
        secondProductSelection,
        "GLEE001",
      ),
    ).toEqual([]);
  });

  it("normaliza IDs al validar complementos permitidos", () => {
    const equivalentAddon: Addon = {
      ...balloon,
      id: "globo-corazon",
    };

    expect(
      isExperienceAddonAllowed(equivalentAddon, [balloon]),
    ).toBe(true);

    expect(
      isExperienceAddonAllowed(chocolate, [balloon]),
    ).toBe(false);
  });

  it("calcula el subtotal usando solo precios positivos", () => {
    const invalidPrice: Addon = {
      ...balloon,
      id: "ADD99",
      price: Number.NaN,
    };

    const negativePrice: Addon = {
      ...balloon,
      id: "ADD98",
      price: -5,
    };

    expect(
      getExperienceAddonsTotal([
        chocolate,
        balloon,
        invalidPrice,
        negativePrice,
      ]),
    ).toBe(25);
  });

  it("permite limpiar la selección conservando su producto", () => {
    expect(clearExperienceAddonSelection(" GLEE001 ")).toEqual({
      productId: "glee001",
      addons: [],
    });
  });

  it("bloquea una selección sin producto principal", () => {
    expect(
      toggleExperienceAddonSelection(
        emptySelection,
        "",
        chocolate,
      ),
    ).toEqual(emptySelection);
  });

  it("impide abrir complementos sin un producto seleccionado", () => {
    expect(canOpenExperienceAddons(null)).toBe(false);
    expect(canOpenExperienceAddons(undefined)).toBe(false);
    expect(canOpenExperienceAddons("   ")).toBe(false);
    expect(canOpenExperienceAddons("GLEE001")).toBe(true);
  });

  it("calcula el total del arreglo y sus complementos", () => {
    expect(getExperienceTotal(120, 25)).toBe(145);
    expect(getExperienceTotal(120, Number.NaN)).toBe(120);
    expect(getExperienceTotal(-10, 25)).toBe(25);
  });});

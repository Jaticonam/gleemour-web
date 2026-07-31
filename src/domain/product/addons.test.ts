import { describe, expect, it } from "vitest";

import type { Addon } from "@/shared/types/product";

import {
  normalizeAddonReference,
  resolveProductAddons,
} from "./addons";

const addonCatalog: Addon[] = [
  {
    id: "Chocolate Premium",
    title: "Chocolate premium",
    price: 20,
    img: "/chocolate.webp",
    category: "chocolates",
    status: "Publicado",
    priority: 20,
  },
  {
    id: "globo-corazón",
    title: "Globo corazón",
    price: 15,
    img: "/globo.webp",
    category: "globos",
    status: "Publicado",
    priority: 10,
  },
];

describe("resolveProductAddons", () => {
  it("normaliza referencias de forma estable", () => {
    expect(normalizeAddonReference("  Globo_Corazón  ")).toBe(
      "globo-corazon",
    );
  });

  it("preserva orden e ignora faltantes y duplicados", () => {
    const resolved = resolveProductAddons(
      [
        "globo-corazon",
        "chocolate-premium",
        "no-existe",
        "globo-corazon",
      ],
      addonCatalog,
    );

    expect(resolved.map((addon) => addon.id)).toEqual([
      "globo-corazón",
      "Chocolate Premium",
    ]);
  });
});

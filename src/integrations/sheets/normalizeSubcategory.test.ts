import { describe, expect, it } from "vitest";

import { normalizeSubcategory } from "./normalizeSubcategory";

describe("normalizeSubcategory", () => {
  it("normaliza el contrato completo del maestro subcategories", () => {
    const subcategory = normalizeSubcategory({
      subcategory_id: "amor-distancia",
      category_id: "PARA-ENAMORAR",
      subcategory: "Amor a distancia",
      icon: "💌",
      description: "Detalles para expresar amor desde lejos.",
      priority: "100",
      status: "publicada",
    });

    expect(subcategory).toEqual({
      id: "amor-distancia",
      categoryId: "para-enamorar",
      name: "Amor a distancia",
      icon: "💌",
      description: "Detalles para expresar amor desde lejos.",
      priority: 100,
      status: "Publicado",
    });
  });

  it("aplica fallbacks seguros a los campos opcionales", () => {
    const subcategory = normalizeSubcategory({
      subcategory_id: "primer-detalle",
      category_id: "para-enamorar",
      subcategory: "Primer detalle",
      icon: "",
      description: "",
      priority: "",
      status: "Publicado",
    });

    expect(subcategory.icon).toBe("✨");
    expect(subcategory.description).toBe("");
    expect(subcategory.priority).toBe(0);
    expect(subcategory.status).toBe("Publicado");
  });
});
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  EXPERIENCE_DEDICATION_MAX_LENGTH,
  confirmExperienceDedication,
  createExperienceDedicationSelection,
  getExperienceDedicationPreview,
  getExperienceDedicationValue,
  hasExperienceDedication,
  normalizeExperienceDedication,
  syncExperienceDedicationSelection,
  updateExperienceDedication,
  visitExperienceDedication,
} from "./dedication.utils";

describe("dedication.utils", () => {
  it("crea una selección vacía para el producto", () => {
    expect(
      createExperienceDedicationSelection(" GLE001 "),
    ).toEqual({
      productId: "GLE001",
      value: "",
      visited: false,
      confirmed: false,
    });
  });

  it("limita el texto a 240 caracteres", () => {
    const value = "a".repeat(
      EXPERIENCE_DEDICATION_MAX_LENGTH + 25,
    );

    expect(normalizeExperienceDedication(value)).toHaveLength(
      EXPERIENCE_DEDICATION_MAX_LENGTH,
    );
  });

  it("marca la etapa como visitada sin exigir texto", () => {
    const current = createExperienceDedicationSelection(
      "GLE001",
    );

    expect(
      visitExperienceDedication(current, "GLE001"),
    ).toEqual({
      productId: "GLE001",
      value: "",
      visited: true,
      confirmed: false,
    });
  });

  it("actualiza el mensaje y retira la confirmación anterior", () => {
    const confirmed = {
      productId: "GLE001",
      value: "Mensaje anterior",
      visited: true,
      confirmed: true,
    };

    expect(
      updateExperienceDedication(
        confirmed,
        "GLE001",
        "Mensaje nuevo",
      ),
    ).toEqual({
      productId: "GLE001",
      value: "Mensaje nuevo",
      visited: true,
      confirmed: false,
    });
  });

  it("permite confirmar una dedicatoria vacía", () => {
    const current = createExperienceDedicationSelection(
      "GLE001",
    );

    expect(
      confirmExperienceDedication(current, "GLE001"),
    ).toEqual({
      productId: "GLE001",
      value: "",
      visited: true,
      confirmed: true,
    });
  });

  it("conserva el estado cuando el producto no cambia", () => {
    const current = {
      productId: "GLE001",
      value: "Gracias por todo",
      visited: true,
      confirmed: true,
    };

    expect(
      syncExperienceDedicationSelection(current, "GLE001"),
    ).toBe(current);
  });

  it("reinicia la dedicatoria cuando cambia el producto", () => {
    const current = {
      productId: "GLE001",
      value: "Gracias por todo",
      visited: true,
      confirmed: true,
    };

    expect(
      syncExperienceDedicationSelection(current, "GLE002"),
    ).toEqual({
      productId: "GLE002",
      value: "",
      visited: false,
      confirmed: false,
    });
  });

  it("solo devuelve el texto para el producto propietario", () => {
    const current = {
      productId: "GLE001",
      value: "Mensaje especial",
      visited: true,
      confirmed: false,
    };

    expect(
      getExperienceDedicationValue(current, "GLE001"),
    ).toBe("Mensaje especial");

    expect(
      getExperienceDedicationValue(current, "GLE002"),
    ).toBe("");
  });

  it("considera vacíos los mensajes compuestos por espacios", () => {
    expect(hasExperienceDedication("   \n  ")).toBe(false);
    expect(hasExperienceDedication(" Gracias ")).toBe(true);
  });

  it("genera una vista resumida legible", () => {
    expect(
      getExperienceDedicationPreview(
        "  Gracias\npor   acompañarme siempre  ",
        18,
      ),
    ).toBe("Gracias por acompa…");
  });
});

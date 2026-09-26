import { describe, expect, it } from "vitest";

import { createQuotationDraft, createQuotationSnapshot } from "@/application/admin/QuotationComposition";

import {
  buildQuotationWhatsAppMessage,
  buildQuotationWhatsAppUrl,
} from "./quotationWhatsapp";

describe("quotationWhatsapp", () => {
  it("construye un mensaje comercial desde el snapshot", () => {
    const draft = createQuotationDraft([], [], new Date("2026-09-19T15:00:00Z"));
    draft.client = { name: "Cliente Demo", whatsapp: "00000000", document: "" };
    draft.conditions.notes = "Delivery incluido";
    const snapshot = createQuotationSnapshot(draft);

    expect(
      buildQuotationWhatsAppMessage(snapshot, "https://media.jungnegocios.com/q/1"),
    ).toContain("Cotización Gleemour");
    expect(buildQuotationWhatsAppMessage(snapshot)).toContain("Delivery incluido");
    expect(buildQuotationWhatsAppUrl(snapshot)).toMatch(
      /^https:\/\/wa\.me\/00000000\?text=/,
    );
  });
});

import { describe, expect, it } from "vitest";

import { createQuotationDraft } from "@/application/admin/QuotationComposition";

import {
  buildQuotationWhatsAppMessage,
  buildQuotationWhatsAppUrl,
} from "./quotationWhatsapp";

describe("quotationWhatsapp", () => {
  it("construye un mensaje comercial desde el snapshot", () => {
    const draft = createQuotationDraft([], [], new Date("2026-09-19T15:00:00Z"));
    draft.client = { name: "Ana", whatsapp: "+51 900 111 222", document: "" };
    draft.conditions.notes = "Delivery incluido";

    expect(
      buildQuotationWhatsAppMessage(draft, "https://media.jungnegocios.com/q/1"),
    ).toContain("Cotización Gleemour");
    expect(buildQuotationWhatsAppMessage(draft)).toContain("Delivery incluido");
    expect(buildQuotationWhatsAppUrl(draft)).toMatch(
      /^https:\/\/wa\.me\/51900111222\?text=/,
    );
  });
});

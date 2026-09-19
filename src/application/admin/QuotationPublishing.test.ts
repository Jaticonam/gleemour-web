import { describe, expect, it, vi } from "vitest";

import { createQuotationDraft } from "./QuotationComposition";
import {
  createQuotationDocumentRequest,
  publishQuotationPdf,
  QUOTATION_DOCUMENT_SCHEMA_VERSION,
} from "./QuotationPublishing";

describe("QuotationPublishing", () => {
  it("crea un request versionado, idempotente y desacoplado del draft", () => {
    const draft = createQuotationDraft([], [], new Date("2026-09-19T15:00:00Z"));
    draft.client.name = "Ana";

    const request = createQuotationDocumentRequest(
      draft,
      new Date("2026-09-19T15:05:00Z"),
    );

    expect(request).toMatchObject({
      schemaVersion: QUOTATION_DOCUMENT_SCHEMA_VERSION,
      requestId: `${draft.id}:pdf:${draft.updatedAt}`,
      appId: "gleemour",
      documentKind: "quotation",
      currency: "PEN",
      requestedAt: "2026-09-19T15:05:00.000Z",
      quotation: { totals: { lineCount: 0, totalUnits: 0, total: 0 } },
    });

    draft.client.name = "Mutado";
    expect(request.quotation.client.name).toBe("Ana");
  });

  it("delega la salida PDF exclusivamente al port documental", async () => {
    const draft = createQuotationDraft([], [], new Date("2026-09-19T15:00:00Z"));
    const publish = vi.fn().mockResolvedValue({
      status: "unavailable",
      code: "JUNG_CORE_NOT_CONFIGURED",
      message: "Pendiente",
    });

    await publishQuotationPdf(
      { draft, requestedAt: new Date("2026-09-19T15:05:00Z") },
      { publish },
    );

    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        schemaVersion: QUOTATION_DOCUMENT_SCHEMA_VERSION,
        requestedAt: "2026-09-19T15:05:00.000Z",
      }),
    );
  });
});

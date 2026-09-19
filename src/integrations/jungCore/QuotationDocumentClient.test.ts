import { describe, expect, it, vi } from "vitest";

import type { QuotationDocumentRequest } from "@/application/admin/QuotationPublishing";

import { createJungCoreQuotationDocumentPort } from "./QuotationDocumentClient";

const request = { requestId: "GLQ-1:pdf:v1" } as QuotationDocumentRequest;

describe("QuotationDocumentClient", () => {
  it("declara unavailable cuando JUNG CORE no está configurado", async () => {
    const port = createJungCoreQuotationDocumentPort({ endpoint: "" });
    await expect(port.publish(request)).resolves.toMatchObject({
      status: "unavailable",
      code: "JUNG_CORE_NOT_CONFIGURED",
    });
  });

  it("envía el contrato JSON y conserva el resultado provider-neutral", async () => {
    const ready = {
      status: "ready",
      publicationId: "pub-1",
      publicUrl: "https://media.jungnegocios.com/q/GLQ-1",
      pdf: {
        assetId: "asset-1",
        kind: "pdf",
        status: "ready",
        url: "https://media.jungnegocios.com/q/GLQ-1.pdf",
        mimeType: "application/pdf",
        version: "1",
      },
      publishedAt: "2026-09-19T15:00:00.000Z",
    };
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(ready), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const port = createJungCoreQuotationDocumentPort({
      endpoint: "https://core.jungnegocios.com/commercial-publications",
      fetchImpl,
    });

    await expect(port.publish(request)).resolves.toEqual(ready);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://core.jungnegocios.com/commercial-publications",
      expect.objectContaining({ method: "POST", body: JSON.stringify(request) }),
    );
  });

  it("cierra de forma segura ante una respuesta incompatible", async () => {
    const port = createJungCoreQuotationDocumentPort({
      endpoint: "https://core.jungnegocios.com/publications",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      ),
    });

    await expect(port.publish(request)).resolves.toMatchObject({
      status: "failed",
      code: "JUNG_CORE_INVALID_RESPONSE",
    });
  });

  it("rechaza un ready incompleto aunque declare un estado conocido", async () => {
    const port = createJungCoreQuotationDocumentPort({
      endpoint: "https://core.jungnegocios.com/publications",
      fetchImpl: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "ready" }), { status: 200 }),
      ),
    });

    await expect(port.publish(request)).resolves.toMatchObject({
      status: "failed",
      code: "JUNG_CORE_INVALID_RESPONSE",
    });
  });
});

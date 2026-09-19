import type {
  QuotationDocumentPort,
  QuotationDocumentRequest,
  QuotationDocumentResult,
} from "@/application/admin/QuotationPublishing";

interface QuotationDocumentClientOptions {
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isResult(value: unknown): value is QuotationDocumentResult {
  if (!isRecord(value)) return false;

  if (value.status === "ready") {
    return Boolean(
      isNonEmptyString(value.publicationId) &&
        isNonEmptyString(value.publicUrl) &&
        isNonEmptyString(value.publishedAt) &&
        isRecord(value.pdf) &&
        value.pdf.kind === "pdf" &&
        value.pdf.status === "ready" &&
        value.pdf.mimeType === "application/pdf" &&
        isNonEmptyString(value.pdf.assetId) &&
        isNonEmptyString(value.pdf.url) &&
        isNonEmptyString(value.pdf.version),
    );
  }

  if (value.status === "pending") {
    return isNonEmptyString(value.publicationId) && isNonEmptyString(value.message);
  }

  if (value.status === "unavailable") {
    return (
      ["JUNG_CORE_NOT_CONFIGURED", "PROVIDER_UNAVAILABLE"].includes(
        String(value.code),
      ) && isNonEmptyString(value.message)
    );
  }

  if (value.status === "failed") {
    return (
      isNonEmptyString(value.code) &&
      isNonEmptyString(value.message) &&
      typeof value.retryable === "boolean"
    );
  }

  return false;
}

export function createJungCoreQuotationDocumentPort({
  endpoint = import.meta.env.VITE_JUNG_CORE_COMMERCIAL_PUBLISHING_URL,
  fetchImpl = fetch,
}: QuotationDocumentClientOptions = {}): QuotationDocumentPort {
  return {
    async publish(
      request: QuotationDocumentRequest,
    ): Promise<QuotationDocumentResult> {
      if (!endpoint?.trim()) {
        return {
          status: "unavailable",
          code: "JUNG_CORE_NOT_CONFIGURED",
          message: "JUNG CORE Commercial Publishing aún no está configurado.",
        };
      }

      try {
        const response = await fetchImpl(endpoint, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          return {
            status: "failed",
            code: `JUNG_CORE_HTTP_${response.status}`,
            message: "JUNG CORE no pudo publicar la cotización.",
            retryable: response.status >= 500,
          };
        }

        const result: unknown = await response.json();
        if (!isResult(result)) {
          return {
            status: "failed",
            code: "JUNG_CORE_INVALID_RESPONSE",
            message: "JUNG CORE devolvió una respuesta incompatible.",
            retryable: false,
          };
        }

        return result;
      } catch {
        return {
          status: "unavailable",
          code: "PROVIDER_UNAVAILABLE",
          message: "JUNG CORE no está disponible en este momento.",
        };
      }
    },
  };
}

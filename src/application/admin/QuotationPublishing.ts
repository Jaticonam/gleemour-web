import {
  createQuotationSnapshot,
  type QuotationDraft,
  type QuotationSnapshot,
} from "./QuotationComposition";

export const QUOTATION_DOCUMENT_SCHEMA_VERSION =
  "jung-core.quotation-document.v1" as const;

export interface PublicAssetReference {
  assetId: string;
  kind: "pdf";
  status: "ready";
  url: string;
  mimeType: "application/pdf";
  version: string;
}

export interface QuotationDocumentRequest {
  schemaVersion: typeof QUOTATION_DOCUMENT_SCHEMA_VERSION;
  requestId: string;
  appId: "gleemour";
  documentKind: "quotation";
  locale: "es-PE";
  currency: "PEN";
  requestedAt: string;
  quotation: QuotationSnapshot;
}

export type QuotationDocumentResult =
  | {
      status: "ready";
      publicationId: string;
      publicUrl: string;
      pdf: PublicAssetReference;
      publishedAt: string;
    }
  | {
      status: "pending";
      publicationId: string;
      message: string;
    }
  | {
      status: "unavailable";
      code: "JUNG_CORE_NOT_CONFIGURED" | "PROVIDER_UNAVAILABLE";
      message: string;
    }
  | {
      status: "failed";
      code: string;
      message: string;
      retryable: boolean;
    };

export interface QuotationDocumentPort {
  publish(request: QuotationDocumentRequest): Promise<QuotationDocumentResult>;
}

/** Safe provider-neutral fallback for tests and composition roots without an adapter. */
export const unavailableQuotationDocumentPort: QuotationDocumentPort = {
  async publish() {
    return {
      status: "unavailable",
      code: "JUNG_CORE_NOT_CONFIGURED",
      message: "No hay un motor de documentos configurado.",
    };
  },
};

export interface QuotationPdfOutputRequest {
  draft: QuotationDraft;
  requestedAt?: Date;
}

export async function publishQuotationPdf(
  output: QuotationPdfOutputRequest,
  port: QuotationDocumentPort,
): Promise<QuotationDocumentResult> {
  return port.publish(
    createQuotationDocumentRequest(output.draft, output.requestedAt),
  );
}

export function createQuotationDocumentRequest(
  draft: QuotationDraft,
  requestedAt = new Date(),
): QuotationDocumentRequest {
  return {
    schemaVersion: QUOTATION_DOCUMENT_SCHEMA_VERSION,
    requestId: `${draft.id}:pdf:${draft.updatedAt}`,
    appId: "gleemour",
    documentKind: "quotation",
    locale: "es-PE",
    currency: "PEN",
    requestedAt: requestedAt.toISOString(),
    quotation: {
      ...createQuotationSnapshot(draft, requestedAt),
    },
  };
}

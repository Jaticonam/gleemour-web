export const COMMERCIAL_OUTPUT_SCHEMA_VERSION =
  "jung.commercial-output.v1" as const;

export type CommercialOutputFormat = "pdf" | "csv" | "print" | "image";

export type CommercialOutputOptionValue =
  | string
  | number
  | boolean
  | null
  | readonly string[];

/**
 * Renderer-neutral options. Format-specific validation belongs to the output
 * engine, never to the commercial composition.
 */
export type CommercialOutputOptions = Readonly<
  Record<string, CommercialOutputOptionValue>
>;

/**
 * Stable envelope for content owned by the consuming application. The payload
 * describes what must be rendered; it must not contain renderer instructions.
 */
export interface CommercialComposition<TPayload = unknown> {
  schemaVersion: string;
  compositionId: string;
  compositionKind: string;
  version: string;
  createdAt: string;
  payload: TPayload;
}

export interface CommercialOutputRequest<
  TComposition extends CommercialComposition = CommercialComposition,
> {
  schemaVersion: typeof COMMERCIAL_OUTPUT_SCHEMA_VERSION;
  requestId: string;
  appId: string;
  format: CommercialOutputFormat;
  requestedAt: string;
  composition: TComposition;
  options?: CommercialOutputOptions;
}

export interface CommercialOutputArtifact {
  artifactId: string;
  format: CommercialOutputFormat;
  filename?: string;
  mimeType?: string;
  publicUrl?: string;
  downloadUrl?: string;
}

export type CommercialOutputResult =
  | {
      status: "ready";
      publicationId: string;
      artifact: CommercialOutputArtifact;
      completedAt: string;
    }
  | {
      status: "pending";
      publicationId: string;
      message?: string;
    }
  | {
      status: "unavailable";
      code: string;
      message: string;
    }
  | {
      status: "failed";
      code: string;
      message: string;
      retryable: boolean;
    };

/** Provider-neutral port. JUNG CORE will be one future adapter, not the domain. */
export interface CommercialOutputEngine {
  generate(
    request: CommercialOutputRequest,
  ): Promise<CommercialOutputResult>;
}

export function createCommercialOutputRequest<
  TComposition extends CommercialComposition,
>(input: {
  requestId: string;
  appId: string;
  format: CommercialOutputFormat;
  requestedAt: Date;
  composition: TComposition;
  options?: CommercialOutputOptions;
}): CommercialOutputRequest<TComposition> {
  return {
    schemaVersion: COMMERCIAL_OUTPUT_SCHEMA_VERSION,
    requestId: input.requestId,
    appId: input.appId,
    format: input.format,
    requestedAt: input.requestedAt.toISOString(),
    composition: input.composition,
    ...(input.options ? { options: { ...input.options } } : {}),
  };
}

import { createHash } from "node:crypto";
import type { CatalogCommercialComposition } from "../src/application/admin/AdminCommercialComposition";
import type { CatalogImageArtifact, CatalogImagePublicationPort } from "../src/application/admin/CatalogImageOutput";
import type { CommercialOutputRequest, CommercialOutputResult } from "../src/application/admin/CommercialOutput";

type Request = CommercialOutputRequest<CatalogCommercialComposition>;

interface CoreResponse {
  jobId: string;
  status: "ready" | "pending" | "running";
  artifact?: {
    artifactId: string;
    mimeType: "image/jpeg";
    checksumSha256: string;
    publicUrl: string;
  } | null;
}

interface PublisherOptions {
  endpoint?: string;
  writeKey?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  now?: () => Date;
}

function failed(code: string, message: string, retryable = false): CommercialOutputResult {
  return { status: "failed", code, message, retryable };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isCoreResponse(value: unknown): value is CoreResponse {
  if (!isRecord(value) || typeof value.jobId !== "string" || !value.jobId) return false;
  if (value.status === "pending" || value.status === "running") return true;
  if (value.status !== "ready" || !isRecord(value.artifact)) return false;
  const artifact = value.artifact;
  return typeof artifact.artifactId === "string" && Boolean(artifact.artifactId) &&
    artifact.mimeType === "image/jpeg" &&
    typeof artifact.checksumSha256 === "string" && /^[0-9a-f]{64}$/.test(artifact.checksumSha256) &&
    typeof artifact.publicUrl === "string" && /^https:\/\/[^\s]+$/.test(artifact.publicUrl);
}

// CORE requires slugs; hash only the external identifiers, never the JPEG fingerprint.
function slugId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 32)}`;
}

/** Server-only adapter. Never import this file into the Vite/browser graph. */
export class JungCoreCommercialImagePublisher implements CatalogImagePublicationPort {
  constructor(private readonly options: PublisherOptions = {}) {
    if (typeof window !== "undefined") throw new Error("SERVER_ONLY");
  }

  async publish(request: Request, image: CatalogImageArtifact): Promise<CommercialOutputResult> {
    const endpoint = this.options.endpoint ?? process.env.JUNG_CORE_COMMERCIAL_ARTIFACTS_URL;
    const writeKey = this.options.writeKey ?? process.env.JUNG_CORE_WRITE_KEY;
    if (!endpoint || !writeKey) {
      return { status: "unavailable", code: "JUNG_CORE_NOT_CONFIGURED", message: "Publicación comercial no configurada." };
    }
    let url: URL;
    try { url = new URL(endpoint); } catch { return failed("INVALID_CONFIG", "Configuración de publicación inválida."); }
    if ((url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) ||
      url.pathname !== "/commercial/artifacts" || url.search || url.hash || url.username || url.password) {
      return failed("INVALID_CONFIG", "Configuración de publicación inválida.");
    }
    const version = request.composition?.payload?.catalog?.versionNumber;
    if (request.appId !== "gleemour" || request.format !== "image" ||
      request.composition?.compositionKind !== "catalog" ||
      !request.requestId || !request.composition.compositionId ||
      !Number.isSafeInteger(version) || version < 1 || version > 1_000_000_000 ||
      image.mimeType !== "image/jpeg" || !image.filename ||
      !Number.isSafeInteger(image.width) || image.width < 1 ||
      !Number.isSafeInteger(image.height) || image.height < 1 ||
      !(image.bytes instanceof Uint8Array) || !image.bytes.length || image.bytes.length > 20_000_000 ||
      image.bytes[0] !== 0xff || image.bytes[1] !== 0xd8 ||
      image.bytes[image.bytes.length - 2] !== 0xff || image.bytes[image.bytes.length - 1] !== 0xd9 ||
      !/^[a-f0-9]{64}$/.test(image.checksumSha256)) {
      return failed("INVALID_IMAGE", "Imagen comercial inválida.");
    }

    const timeoutMs = this.options.timeoutMs ?? 30_000;
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 120_000) {
      return failed("INVALID_CONFIG", "Configuración de publicación inválida.");
    }
    try {
      const response = await (this.options.fetchImpl ?? fetch)(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-jung-core-write-key": writeKey,
        },
        body: JSON.stringify({
          appId: "gleemour",
          brand: "gleemour",
          compositionType: "catalog",
          artifactId: slugId("catalog", request.composition.compositionId),
          requestId: slugId("request", request.requestId),
          version,
          mimeType: "image/jpeg",
          contentBase64: Buffer.from(image.bytes).toString("base64"),
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.status === 401) return failed("AUTHORIZATION_FAILED", "CORE rechazó la autorización.");
      if (response.status === 409) return failed("PUBLICATION_CONFLICT", "El artefacto comercial presenta un conflicto.");
      if (!response.ok) return failed(response.status >= 500 ? "CORE_UNAVAILABLE" : "CORE_REQUEST_REJECTED", "CORE no pudo publicar la imagen.", response.status >= 500);

      let result: unknown;
      try { result = await response.json(); } catch { return failed("CORE_INVALID_RESPONSE", "CORE devolvió una respuesta inválida."); }
      if (!isCoreResponse(result)) return failed("CORE_INVALID_RESPONSE", "CORE devolvió una respuesta inválida.");
      if (result.status !== "ready") return { status: "pending", publicationId: result.jobId, message: "Publicación en curso." };
      if (result.artifact!.checksumSha256 !== image.checksumSha256) {
        return failed("CHECKSUM_MISMATCH", "La imagen publicada no coincide con el archivo generado.");
      }
      return {
        status: "ready",
        publicationId: result.jobId,
        artifact: {
          artifactId: result.artifact!.artifactId,
          format: "image",
          filename: image.filename,
          mimeType: "image/jpeg",
          publicUrl: result.artifact!.publicUrl,
          checksumSha256: result.artifact!.checksumSha256,
        },
        completedAt: (this.options.now?.() ?? new Date()).toISOString(),
      };
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        return failed("CORE_TIMEOUT", "CORE tardó demasiado en publicar la imagen.", true);
      }
      return { status: "unavailable", code: "PROVIDER_UNAVAILABLE", message: "CORE no está disponible." };
    }
  }
}

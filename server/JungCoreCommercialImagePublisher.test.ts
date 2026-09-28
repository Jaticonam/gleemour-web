// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createCommercialOutputRequest } from "../src/application/admin/CommercialOutput";
import type { CatalogCommercialComposition } from "../src/application/admin/AdminCommercialComposition";
import type { CatalogImageArtifact } from "../src/application/admin/CatalogImageOutput";
import { JungCoreCommercialImagePublisher } from "./JungCoreCommercialImagePublisher";

const checksum = "a".repeat(64);
const image = {
  bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
  filename: "gleemour-catalog-page-01.jpg",
  mimeType: "image/jpeg", width: 1080, height: 1440,
  checksumSha256: checksum, warnings: [],
} satisfies CatalogImageArtifact;
const composition = {
  schemaVersion: "gleemour.catalog-output.v1",
  compositionId: "catalog:2026:v1",
  compositionKind: "catalog",
  version: "1",
  createdAt: "2026-09-27T00:00:00.000Z",
  payload: { catalog: { versionNumber: 1 } },
} as CatalogCommercialComposition;
const request = createCommercialOutputRequest({
  requestId: "publish:1", appId: "gleemour", format: "image",
  requestedAt: new Date("2026-09-27T00:00:00.000Z"), composition,
});
const response = (status: number, value?: unknown) => ({
  status, ok: status >= 200 && status < 300,
  json: async () => value,
} as Response);
const coreReady = {
  status: "ready", jobId: "job-1",
  artifact: { artifactId: "asset-1", mimeType: "image/jpeg", checksumSha256: checksum, publicUrl: "https://pub.example.test/a.jpg" },
};
const options = { endpoint: "http://127.0.0.1:3000/commercial/artifacts", writeKey: "test-secret" };

describe("JungCoreCommercialImagePublisher (server only)", () => {
  it("transports already rendered JPEG and maps CORE response into CommercialOutputResult", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(200, coreReady));
    const publisher = new JungCoreCommercialImagePublisher({ ...options, fetchImpl, now: () => new Date("2026-09-27T12:00:00Z") });
    const result = await publisher.publish(request, image);
    expect(result).toEqual({
      status: "ready", publicationId: "job-1", completedAt: "2026-09-27T12:00:00.000Z",
      artifact: { artifactId: "asset-1", format: "image", filename: image.filename, mimeType: "image/jpeg", publicUrl: coreReady.artifact.publicUrl, checksumSha256: checksum },
    });
    const [url, init] = fetchImpl.mock.calls[0] as [URL, RequestInit];
    expect(url.href).toBe(options.endpoint);
    expect(init.headers).toMatchObject({ "x-jung-core-write-key": options.writeKey });
    const body = JSON.parse(String(init.body));
    expect(body).toEqual({
      appId: "gleemour", brand: "gleemour", compositionType: "catalog", version: 1,
      mimeType: "image/jpeg", contentBase64: Buffer.from(image.bytes).toString("base64"),
      artifactId: expect.stringMatching(/^catalog-[0-9a-f]{32}$/),
      requestId: expect.stringMatching(/^request-[0-9a-f]{32}$/),
    });
    await publisher.publish(request, image);
    expect(JSON.parse(String(fetchImpl.mock.calls[1][1].body)).artifactId).toBe(body.artifactId);
  });

  it.each([
    [401, "AUTHORIZATION_FAILED", false],
    [409, "PUBLICATION_CONFLICT", false],
    [422, "CORE_REQUEST_REJECTED", false],
    [500, "CORE_UNAVAILABLE", true],
  ])("maps HTTP %i without disclosing response or key", async (status, code, retryable) => {
    const result = await new JungCoreCommercialImagePublisher({ ...options, fetchImpl: vi.fn().mockResolvedValue(response(status, { secret: "LEAK" })) }).publish(request, image);
    expect(result).toMatchObject({ status: "failed", code, retryable });
    expect(JSON.stringify(result)).not.toContain("LEAK");
    expect(JSON.stringify(result)).not.toContain(options.writeKey);
  });

  it("handles timeout and network failures independently", async () => {
    const timedOut = new JungCoreCommercialImagePublisher({ ...options, fetchImpl: vi.fn().mockRejectedValue(new DOMException("Timeout", "TimeoutError")) });
    expect(await timedOut.publish(request, image)).toMatchObject({ status: "failed", code: "CORE_TIMEOUT", retryable: true });
    const offline = new JungCoreCommercialImagePublisher({ ...options, fetchImpl: vi.fn().mockRejectedValue(new TypeError("secret connection details")) });
    expect(await offline.publish(request, image)).toMatchObject({ status: "unavailable", code: "PROVIDER_UNAVAILABLE" });
  });

  it("rejects invalid CORE responses and checksum mismatches", async () => {
    const invalid = new JungCoreCommercialImagePublisher({ ...options, fetchImpl: vi.fn().mockResolvedValue(response(200, { status: "ready", jobId: "x" })) });
    expect(await invalid.publish(request, image)).toMatchObject({ status: "failed", code: "CORE_INVALID_RESPONSE" });
    const mismatch = new JungCoreCommercialImagePublisher({ ...options, fetchImpl: vi.fn().mockResolvedValue(response(200, { ...coreReady, artifact: { ...coreReady.artifact, checksumSha256: "b".repeat(64) } })) });
    expect(await mismatch.publish(request, image)).toMatchObject({ status: "failed", code: "CHECKSUM_MISMATCH" });
  });

  it("rejects unsafe endpoints, unconfigured secrets, and invalid JPEG before transport", async () => {
    const fetchImpl = vi.fn();
    expect(await new JungCoreCommercialImagePublisher({ ...options, endpoint: "http://example.com/commercial/artifacts", fetchImpl }).publish(request, image)).toMatchObject({ status: "failed", code: "INVALID_CONFIG" });
    expect(await new JungCoreCommercialImagePublisher({ ...options, writeKey: "", fetchImpl }).publish(request, image)).toMatchObject({ status: "unavailable", code: "JUNG_CORE_NOT_CONFIGURED" });
    expect(await new JungCoreCommercialImagePublisher({ ...options, fetchImpl }).publish(request, { ...image, bytes: new Uint8Array([0x00]) })).toMatchObject({ status: "failed", code: "INVALID_IMAGE" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns pending for a claimed concurrent job", async () => {
    const publisher = new JungCoreCommercialImagePublisher({ ...options, fetchImpl: vi.fn().mockResolvedValue(response(200, { status: "running", jobId: "job-2", artifact: null })) });
    expect(await publisher.publish(request, image)).toMatchObject({ status: "pending", publicationId: "job-2" });
  });
});

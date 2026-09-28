// @vitest-environment node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { it } from "vitest";
import type { CatalogCommercialComposition } from "../src/application/admin/AdminCommercialComposition";
import type { CatalogImageArtifact } from "../src/application/admin/CatalogImageOutput";
import { createCommercialOutputRequest } from "../src/application/admin/CommercialOutput";
import { JungCoreCommercialImagePublisher } from "./JungCoreCommercialImagePublisher";

const hash = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function ready(url: string, child: ChildProcess) {
  for (let i = 0; i < 45; i++) {
    if (child.exitCode !== null) throw new Error("SERVICE_START_FAILED");
    if (await fetch(url, { signal: AbortSignal.timeout(700) }).then((r) => r.ok, () => false)) return;
    await pause(500);
  }
  throw new Error("SERVICE_NOT_READY");
}

it.skipIf(process.env.GLEEMOUR_CORE_E2E !== "1")("renders a real JPEG in Chrome and publishes it through CORE to dev R2", async () => {
  const root = process.env.JUNG_CORE_LOCAL_DIR;
  if (!root || !process.env.JUNG_CORE_WRITE_KEY || !process.env.DATABASE_URL ||
      process.env.JUNG_CORE_R2_BUCKET !== "jung-commercial-dev") throw new Error("DEV_CONFIG_REQUIRED");
  const db = new URL(process.env.DATABASE_URL);
  assert.equal(db.hostname, "127.0.0.1");
  assert.equal(db.pathname, "/jung_core_dev");
  assert.equal(decodeURIComponent(db.username), "jung_core_cp03a");
  assert.equal(execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim(), "266bc27");

  const port = Number(process.env.PORT || "3000");
  const coreUrl = `http://127.0.0.1:${port}`;
  const viteUrl = "http://127.0.0.1:18082";
  for (const url of [`${coreUrl}/health`, viteUrl]) {
    if (await fetch(url, { signal: AbortSignal.timeout(700) }).then(() => true, () => false)) throw new Error("TEST_PORT_IN_USE");
  }
  const viteEnv = { ...process.env };
  for (const key of Object.keys(viteEnv)) {
    if (key.startsWith("JUNG_CORE_") || key === "DATABASE_URL" || key === "PORT") delete viteEnv[key];
  }
  const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "18082", "--strictPort"],
    { cwd: process.cwd(), env: viteEnv, stdio: "ignore", windowsHide: true });
  let core: ChildProcess | undefined;
  try {
    await ready(viteUrl, vite);
    core = spawn(process.execPath, ["dist/src/main.js"], { cwd: root, stdio: "ignore", windowsHide: true });
    await ready(`${coreUrl}/ready`, core);

    const composition: CatalogCommercialComposition = {
      schemaVersion: "gleemour.catalog-output.v1", compositionId: `m9b2-cert-${Date.now()}`,
      compositionKind: "catalog", version: "1", createdAt: new Date().toISOString(),
      payload: {
        catalog: {
          schemaVersion: "gleemour.admin.catalog-draft.v1", catalogId: "m9b2-cert",
          catalogVersionId: "m9b2-cert-v1", versionNumber: 1, status: "ready", compositionStrategy: "snapshot",
          source: { type: "all" }, composition: { productIds: ["demo"], excludedProductIds: [], order: ["demo"] },
          settings: { title: "Certificación M9B.2" }, snapshotAt: new Date().toISOString(),
        },
        products: [{ productId: "demo", productCode: "DEMO", name: "Producto de prueba", imageUrl: "",
          price: 10, offerPrice: null, stock: 1 }],
      },
    };

    const browser = await chromium.launch({ channel: "chrome", headless: true });
    let image: CatalogImageArtifact;
    try {
      const page = await browser.newPage();
      await page.goto(viteUrl);
      const encoded = await page.evaluate(async (input) => {
        const url = "/src/integrations/browser/CanvasCatalogImageRenderer.ts";
        const { CanvasCatalogImageRenderer } = await import(/* @vite-ignore */ url);
        const jpeg = await new CanvasCatalogImageRenderer().render(input);
        return { ...jpeg, bytes: Array.from(jpeg.bytes) };
      }, composition);
      image = { ...encoded, bytes: new Uint8Array(encoded.bytes) } as CatalogImageArtifact;
    } finally { await browser.close(); }
    assert.equal(image.mimeType, "image/jpeg");
    assert.equal(hash(image.bytes), image.checksumSha256);
    assert.equal(image.width, 1080);
    assert.equal(image.height, 1440);

    const request = createCommercialOutputRequest({ requestId: `${composition.compositionId}-first`, appId: "gleemour", format: "image", requestedAt: new Date(), composition });
    const publisher = new JungCoreCommercialImagePublisher({ endpoint: `${coreUrl}/commercial/artifacts` });
    const output = await publisher.publish(request, image);
    if (output.status !== "ready") throw new Error(`PUBLISH_${output.status}_${"code" in output ? output.code : ""}`);
    assert.equal(output.artifact.checksumSha256, image.checksumSha256);
    const publicResponse = await fetch(output.artifact.publicUrl!, { signal: AbortSignal.timeout(10000) });
    assert.equal(publicResponse.status, 200);
    assert.equal(hash(new Uint8Array(await publicResponse.arrayBuffer())), image.checksumSha256);

    const again = await publisher.publish(request, image);
    assert.equal(again.status, "ready");
    if (again.status === "ready") assert.equal(again.publicationId, output.publicationId);
    const different = new Uint8Array([...image.bytes.slice(0, -2), 0, 0xff, 0xd9]);
    const conflict = await publisher.publish(request, { ...image, bytes: different, checksumSha256: hash(different) });
    assert.equal(conflict.status, "failed");
    if (conflict.status === "failed") assert.equal(conflict.code, "PUBLICATION_CONFLICT");

    const coreRequire = createRequire(join(root, "package.json"));
    const { PrismaClient } = coreRequire("@prisma/client");
    const { PrismaPg } = coreRequire("@prisma/adapter-pg");
    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
    try {
      const row = await prisma.commercialJob.findUnique({ where: { id: output.publicationId }, include: { artifact: true } });
      assert.equal(row?.status, "ready");
      assert.equal(row?.artifact?.checksumSha256, image.checksumSha256);
      assert.equal(row?.artifact?.publicUrl, output.artifact.publicUrl);
    } finally { await prisma.$disconnect(); }
  } finally {
    core?.kill();
    vite.kill();
  }
}, 120_000);

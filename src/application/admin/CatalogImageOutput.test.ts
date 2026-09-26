import { describe, expect, it, vi } from "vitest";
import type { CatalogCommercialComposition } from "./AdminCommercialComposition";
import { GLEEMOUR_CATALOG_IMAGE_PRESET } from "./CatalogImageOutput";
import { CanvasCatalogImageRenderer, type ImageResolver } from "@/integrations/browser/CanvasCatalogImageRenderer";

function composition(count = 2): CatalogCommercialComposition {
  const products = Array.from({ length: count }, (_, index) => ({
    productId: `P-${index + 1}`, productCode: `GLE-${index + 1}`,
    name: index === 0 ? "Ramo Aurora" : `Producto ${index + 1}`,
    imageUrl: `fixture:${index + 1}`, price: 100 + index,
    offerPrice: index === 0 ? 89 : null, stock: 2,
  }));
  return {
    schemaVersion: "gleemour.catalog-output.v1", compositionId: "catalog:v1",
    compositionKind: "catalog", version: "1", createdAt: "1970-01-01T00:00:00.000Z",
    payload: {
      catalog: {
        schemaVersion: "gleemour.admin.catalog-draft.v1", catalogId: "catalog",
        catalogVersionId: "catalog:v1", versionNumber: 1, status: "ready",
        compositionStrategy: "snapshot", source: { type: "all" },
        composition: { productIds: products.map((p) => p.productId), excludedProductIds: [], order: products.map((p) => p.productId) },
        settings: { title: "Catálogo Primavera" }, snapshotAt: "1970-01-01T00:00:00.000Z",
      },
      products,
    },
  };
}

function harness(failedUrl?: string) {
  const fillText = vi.fn();
  const context = {
    fillStyle: "", font: "", textAlign: "start", fillRect: vi.fn(), fillText,
    drawImage: vi.fn(), beginPath: vi.fn(), arc: vi.fn(), fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  const canvas = {
    width: 1080, height: 1440, getContext: vi.fn().mockReturnValue(context),
    toBlob: vi.fn(),
  } as unknown as HTMLCanvasElement;
  const resolver: ImageResolver = {
    resolve: vi.fn((url: string) => url === failedUrl
      ? Promise.reject(new Error("404"))
      : Promise.resolve({ width: 300, height: 400 } as CanvasImageSource)),
  };
  return {
    renderer: new CanvasCatalogImageRenderer(
      resolver,
      () => canvas,
      async () => new TextEncoder().encode("deterministic-jpeg"),
    ),
    fillText,
  };
}

describe("CanvasCatalogImageRenderer", () => {
  it("genera JPEG 1080×1440 y conserva orden, precio y oferta", async () => {
    const { renderer, fillText } = harness();
    const output = await renderer.render(composition());
    expect(output).toMatchObject({ filename: "gleemour-catalog-page-01.jpg", mimeType: "image/jpeg", width: 1080, height: 1440, warnings: [] });
    const texts = fillText.mock.calls.map(([text]) => String(text));
    expect(texts.indexOf("Ramo Aurora")).toBeLessThan(texts.indexOf("Producto 2"));
    expect(texts).toContain("S/ 89.00");
    expect(texts).toContain("Antes S/ 100.00");
  });

  it("es determinista para la misma composición y preset", async () => {
    expect((await harness().renderer.render(composition())).checksumSha256)
      .toBe((await harness().renderer.render(composition())).checksumSha256);
  });

  it("usa fallback controlado si falla un asset", async () => {
    expect((await harness("fixture:1").renderer.render(composition())).warnings)
      .toEqual([expect.objectContaining({ code: "ASSET_FALLBACK", productCode: "GLE-1" })]);
  });

  it("rechaza más productos que el máximo", async () => {
    await expect(harness().renderer.render(composition(7))).rejects.toMatchObject({ code: "TOO_MANY_PRODUCTS" });
  });

  it("rechaza un preset distinto", async () => {
    await expect(harness().renderer.render(composition(), { ...GLEEMOUR_CATALOG_IMAGE_PRESET, width: 1200 }))
      .rejects.toMatchObject({ code: "INVALID_PRESET" });
  });
});

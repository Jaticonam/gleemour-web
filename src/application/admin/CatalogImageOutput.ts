import type { CatalogCommercialComposition } from "./AdminCommercialComposition";

export interface CatalogImagePreset {
  id: string; version: number; width: number; height: number;
  mimeType: "image/jpeg"; quality: number; maxProducts: number;
}

export const GLEEMOUR_CATALOG_IMAGE_PRESET: Readonly<CatalogImagePreset> = Object.freeze({
  id: "gleemour-catalog-page-v1", version: 1, width: 1080, height: 1440,
  mimeType: "image/jpeg", quality: 0.9, maxProducts: 6,
});

export interface CatalogImageWarning {
  code: "ASSET_FALLBACK"; productCode: string; message: string;
}

export interface CatalogImageArtifact {
  bytes: Uint8Array;
  filename: "gleemour-catalog-page-01.jpg";
  mimeType: "image/jpeg";
  width: number; height: number; checksumSha256: string;
  warnings: readonly CatalogImageWarning[];
}

export interface CatalogImageRenderer {
  render(composition: CatalogCommercialComposition, preset?: Readonly<CatalogImagePreset>): Promise<CatalogImageArtifact>;
}

export type CatalogImageOutputErrorCode = "INVALID_COMPOSITION" | "INVALID_PRESET" | "TOO_MANY_PRODUCTS" | "RENDER_FAILED";

export class CatalogImageOutputError extends Error {
  constructor(readonly code: CatalogImageOutputErrorCode, message: string) {
    super(message);
    this.name = "CatalogImageOutputError";
  }
}

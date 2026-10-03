import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
} from "@/application/publicAssets/PublicAssetContract";

import {
  GLEEMOUR_BRAND_ASSET_URLS,
} from "@/tenant/assets/publicAssets";

import {
  getGleemourBrandAssetUrl,
  resolveGleemourBrandAsset,
} from "./GleemourPublicAssets";

describe("GleemourPublicAssets", () => {
  it("resuelve logo-primary desde el provider local", () => {
    expect(
      getGleemourBrandAssetUrl(
        "logo-primary",
      ),
    ).toBe(
      GLEEMOUR_BRAND_ASSET_URLS.logoPrimary,
    );
  });

  it("degrada logo-light y logo-dark hacia logo-primary", () => {
    expect(
      getGleemourBrandAssetUrl(
        "logo-light",
      ),
    ).toBe(
      GLEEMOUR_BRAND_ASSET_URLS.logoPrimary,
    );

    expect(
      getGleemourBrandAssetUrl(
        "logo-dark",
      ),
    ).toBe(
      GLEEMOUR_BRAND_ASSET_URLS.logoPrimary,
    );
  });

  it("no inventa symbol ni app-icon inexistentes", () => {
    expect(
      resolveGleemourBrandAsset(
        "symbol",
      ),
    ).toBeNull();

    expect(
      resolveGleemourBrandAsset(
        "app-icon",
      ),
    ).toBeNull();
  });

  it("permite anteponer JUNG Media sin cambiar consumidores", () => {
    const mediaAsset:
      PublicAssetDescriptor = {
        assetId:
          "media:gleemour:logo-primary:v2",
        app: "gleemour",
        scope: "brand",
        role: "logo-primary",
        publicUrl:
          "https://media.jung.test/gleemour/logo.png",
        mimeType: "image/png",
        version: "v2",
        status: "ACTIVE",
      };

    const mediaProvider:
      PublicAssetProvider = {
        resolve: vi.fn(
          (request) =>
            request.role === "logo-primary"
              ? mediaAsset
              : null,
        ),
      };

    expect(
      getGleemourBrandAssetUrl(
        "logo-primary",
        [mediaProvider],
      ),
    ).toBe(mediaAsset.publicUrl);
  });
});
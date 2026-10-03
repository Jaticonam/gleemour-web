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
  GLEEMOUR_SOCIAL_OG_PRESET,
} from "@/tenant/assets/publicAssets";

import {
  getGleemourBrandAssetUrl,
  getGleemourSocialAssetUrl,
  resolveGleemourBrandAsset,
  resolveGleemourSocialAsset,
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

  it("declara social-og-v1 con contrato 1200x630 JPEG", () => {
    expect(
      GLEEMOUR_SOCIAL_OG_PRESET,
    ).toEqual({
      id: "social-og-v1",
      width: 1200,
      height: 630,
      mimeType: "image/jpeg",
    });
  });

  it("no inventa un og-default local inexistente", () => {
    expect(
      resolveGleemourSocialAsset({
        role: "og-default",
      }),
    ).toBeNull();
  });

  it("resuelve og-product exacto desde un provider futuro", () => {
    const productOg:
      PublicAssetDescriptor = {
        assetId:
          "media:gleemour:og-product:GLE-001",
        app: "gleemour",
        scope: "social",
        role: "og-product",
        entityType: "product",
        entityId: "GLE-001",
        preset: "social-og-v1",
        publicUrl:
          "https://media.jung.test/gleemour/og/GLE-001.jpg",
        mimeType: "image/jpeg",
        width: 1200,
        height: 630,
        version: "v1",
        status: "ACTIVE",
      };

    const provider:
      PublicAssetProvider = {
        resolve: vi.fn(
          (request) =>
            request.role === "og-product"
              ? productOg
              : null,
        ),
      };

    expect(
      getGleemourSocialAssetUrl(
        {
          role: "og-product",
          entityType: "product",
          entityId: "GLE-001",
        },
        [provider],
      ),
    ).toBe(productOg.publicUrl);
  });

  it("degrada category campaign y product hacia og-default", () => {
    const defaultOg:
      PublicAssetDescriptor = {
        assetId:
          "media:gleemour:og-default",
        app: "gleemour",
        scope: "social",
        role: "og-default",
        preset: "social-og-v1",
        publicUrl:
          "https://media.jung.test/gleemour/og/default.jpg",
        mimeType: "image/jpeg",
        width: 1200,
        height: 630,
        version: "v1",
        status: "ACTIVE",
      };

    const provider:
      PublicAssetProvider = {
        resolve: vi.fn(
          (request) =>
            request.role === "og-default"
              ? defaultOg
              : null,
        ),
      };

    expect(
      getGleemourSocialAssetUrl(
        {
          role: "og-category",
          entityType: "category",
          entityId: "enamorar",
        },
        [provider],
      ),
    ).toBe(defaultOg.publicUrl);

    expect(
      getGleemourSocialAssetUrl(
        {
          role: "og-campaign",
          entityType: "campaign",
          entityId: "san-valentin",
        },
        [provider],
      ),
    ).toBe(defaultOg.publicUrl);

    expect(
      getGleemourSocialAssetUrl(
        {
          role: "og-product",
          entityType: "product",
          entityId: "GLE-001",
        },
        [provider],
      ),
    ).toBe(defaultOg.publicUrl);
  });

  it("rechaza combinaciones role/entity invalidas", () => {
    expect(
      resolveGleemourSocialAsset({
        role: "og-product",
        entityType: "campaign",
        entityId: "GLE-001",
      }),
    ).toBeNull();

    expect(
      resolveGleemourSocialAsset({
        role: "og-category",
        entityType: "category",
      }),
    ).toBeNull();
  });
});
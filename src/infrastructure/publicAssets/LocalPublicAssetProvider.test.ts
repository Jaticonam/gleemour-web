import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ASSETS_CONFIG,
} from "@/tenant/assets/assets";

import {
  localPublicAssetProvider,
} from "./LocalPublicAssetProvider";

describe("localPublicAssetProvider", () => {
  it("resuelve el logo principal legado mediante contrato semántico", () => {
    const result =
      localPublicAssetProvider.resolve({
        app: "gleemour",
        scope: "brand",
        role: "logo-primary",
      });

    expect(result).toMatchObject({
      assetId:
        "gleemour:brand:logo-primary",
      app: "gleemour",
      scope: "brand",
      role: "logo-primary",
      publicUrl: ASSETS_CONFIG.logo,
      status: "ACTIVE",
    });
  });

  it("resuelve el favicon actual sin exponer rutas físicas de Media", () => {
    const result =
      localPublicAssetProvider.resolve({
        app: "gleemour",
        scope: "brand",
        role: "favicon",
      });

    expect(result?.publicUrl).toBe(
      "https://gleemour.com/favicon.ico",
    );

    expect(result).not.toHaveProperty(
      "storageKey",
    );

    expect(result).not.toHaveProperty(
      "filesystemPath",
    );
  });

  it("no inventa OG local antes de A10.3", () => {
    const result =
      localPublicAssetProvider.resolve({
        app: "gleemour",
        scope: "social",
        role: "og-default",
        preset: "social-og-v1",
      });

    expect(result).toBeNull();
  });

  it("no resuelve assets de otra aplicación", () => {
    const result =
      localPublicAssetProvider.resolve({
        app: "wooly",
        scope: "brand",
        role: "logo-primary",
      });

    expect(result).toBeNull();
  });
});
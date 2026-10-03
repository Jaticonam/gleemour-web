import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  WebAssetDescriptor,
  WebAssetProvider,
} from "@/application/webAssets/WebAssetContract";

import {
  jungMediaWebAssetProvider,
} from "@/infrastructure/webAssets/JungMediaWebAssetProvider";

import {
  configureGleemourWebAssetProviders,
  getGleemourWebAssetUrl,
  resolveGleemourWebAsset,
} from "./GleemourWebAssets";

describe(
  "GleemourWebAssets",
  () => {
    beforeEach(() => {
      configureGleemourWebAssetProviders(
        [],
      );
    });

    it(
      "no inventa WEB assets si no hay provider",
      () => {
        expect(
          resolveGleemourWebAsset(
            "home-hero",
          ),
        ).toBeNull();
      },
    );

    it(
      "resuelve home-hero desde JUNG Media",
      () => {
        configureGleemourWebAssetProviders([
          jungMediaWebAssetProvider,
        ]);

        expect(
          getGleemourWebAssetUrl(
            "home-hero",
          ),
        ).toBe(
          "https://media.jungnegocios.com/gleemour/public/web/home-hero.jpg",
        );
      },
    );

    it(
      "ignora descriptors INACTIVE",
      () => {
        const inactive:
          WebAssetDescriptor = {
            assetId:
              "test:home-hero",
            app:
              "gleemour",
            role:
              "home-hero",
            publicUrl:
              "https://example.test/hero.jpg",
            mimeType:
              "image/jpeg",
            status:
              "INACTIVE",
          };

        const provider:
          WebAssetProvider = {
            resolve: vi.fn(
              () => inactive,
            ),
          };

        expect(
          resolveGleemourWebAsset(
            "home-hero",
            [provider],
          ),
        ).toBeNull();
      },
    );

    it(
      "es fail-soft si un provider falla",
      () => {
        const failingProvider:
          WebAssetProvider = {
            resolve: vi.fn(() => {
              throw new Error(
                "Provider unavailable",
              );
            }),
          };

        expect(
          resolveGleemourWebAsset(
            "home-hero",
            [
              failingProvider,
              jungMediaWebAssetProvider,
            ],
          )?.publicUrl,
        ).toBe(
          "https://media.jungnegocios.com/gleemour/public/web/home-hero.jpg",
        );
      },
    );
  },
);
import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getGleemourBrandAssetUrl,
  getGleemourSocialAssetUrl,
} from "@/app/publicAssets/GleemourPublicAssets";

import {
  createJungMediaPublicAssetProvider,
  jungMediaPublicAssetProvider,
} from "./JungMediaPublicAssetProvider";

describe(
  "JungMediaPublicAssetProvider",
  () => {
    it(
      "resuelve logo-primary desde el CDN público de JUNG Media",
      () => {
        const asset =
          jungMediaPublicAssetProvider.resolve({
            app:
              "gleemour",
            scope:
              "brand",
            role:
              "logo-primary",
          });

        expect(asset).toMatchObject({
          app:
            "gleemour",
          scope:
            "brand",
          role:
            "logo-primary",
          publicUrl:
            "https://media.jungnegocios.com/gleemour/public/brand/logo-primary.png",
          mimeType:
            "image/png",
          width:
            1090,
          height:
            291,
          status:
            "ACTIVE",
        });

        expect(
          asset?.checksumSha256,
        ).toBe(
          "54358a5826224d43f96fdb9068db4b2b2a546d84b7b78b177b143117245ac28a",
        );
      },
    );

    it(
      "traduce el scope físico Media og al scope semántico social",
      () => {
        const asset =
          jungMediaPublicAssetProvider.resolve({
            app:
              "gleemour",
            scope:
              "social",
            role:
              "og-default",
            preset:
              "social-og-v1",
          });

        expect(asset).toMatchObject({
          app:
            "gleemour",
          scope:
            "social",
          role:
            "og-default",
          preset:
            "social-og-v1",
          publicUrl:
            "https://media.jungnegocios.com/gleemour/public/og/og-default.jpg",
          mimeType:
            "image/jpeg",
          width:
            1200,
          height:
            630,
          status:
            "ACTIVE",
        });

        expect(
          asset?.checksumSha256,
        ).toBe(
          "667a3a5628f3d8b4f9d5ab569234c00a74d3e98d18b321242ea4288757d3ddd1",
        );
      },
    );

    it(
      "no inventa roles que JUNG Media todavía no publicó",
      () => {
        expect(
          jungMediaPublicAssetProvider.resolve({
            app:
              "gleemour",
            scope:
              "brand",
            role:
              "symbol",
          }),
        ).toBeNull();

        expect(
          jungMediaPublicAssetProvider.resolve({
            app:
              "gleemour",
            scope:
              "brand",
            role:
              "app-icon",
          }),
        ).toBeNull();
      },
    );

    it(
      "no responde para otra aplicación",
      () => {
        expect(
          jungMediaPublicAssetProvider.resolve({
            app:
              "wooly",
            scope:
              "brand",
            role:
              "logo-primary",
          }),
        ).toBeNull();
      },
    );

    it(
      "permite fallback semántico logo-light hacia logo-primary Media",
      () => {
        expect(
          getGleemourBrandAssetUrl(
            "logo-light",
            [
              jungMediaPublicAssetProvider,
            ],
          ),
        ).toBe(
          "https://media.jungnegocios.com/gleemour/public/brand/logo-primary.png",
        );
      },
    );

    it(
      "permite fallback og-product hacia og-default Media",
      () => {
        expect(
          getGleemourSocialAssetUrl(
            {
              role:
                "og-product",
              entityType:
                "product",
              entityId:
                "GLE-001",
            },
            [
              jungMediaPublicAssetProvider,
            ],
          ),
        ).toBe(
          "https://media.jungnegocios.com/gleemour/public/og/og-default.jpg",
        );
      },
    );

    it(
      "mantiene provider reusable para snapshots controlados",
      () => {
        const provider =
          createJungMediaPublicAssetProvider(
            [],
          );

        expect(
          provider.resolve({
            app:
              "gleemour",
            scope:
              "brand",
            role:
              "logo-primary",
          }),
        ).toBeNull();
      },
    );
  },
);
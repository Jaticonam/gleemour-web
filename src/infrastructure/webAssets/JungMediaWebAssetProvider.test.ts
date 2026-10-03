import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createJungMediaWebAssetProvider,
  jungMediaWebAssetProvider,
} from "./JungMediaWebAssetProvider";

describe(
  "JungMediaWebAssetProvider",
  () => {
    it(
      "resuelve home-hero desde JUNG Media por URL pública estable",
      () => {
        const asset =
          jungMediaWebAssetProvider.resolve({
            app:
              "gleemour",
            role:
              "home-hero",
          });

        expect(asset).toEqual({
          assetId:
            "jung-media:gleemour:web:home-hero",
          app:
            "gleemour",
          role:
            "home-hero",
          publicUrl:
            "https://media.jungnegocios.com/gleemour/public/web/home-hero.jpg",
          mimeType:
            "image/jpeg",
          status:
            "ACTIVE",
        });
      },
    );

    it(
      "no fija metadata física mutable del asset",
      () => {
        const asset =
          jungMediaWebAssetProvider.resolve({
            app:
              "gleemour",
            role:
              "home-hero",
          });

        expect(asset).not.toHaveProperty(
          "width",
        );

        expect(asset).not.toHaveProperty(
          "height",
        );

        expect(asset).not.toHaveProperty(
          "version",
        );

        expect(asset).not.toHaveProperty(
          "checksumSha256",
        );

        expect(asset).not.toHaveProperty(
          "updatedAt",
        );
      },
    );

    it(
      "no responde para otra aplicación",
      () => {
        expect(
          jungMediaWebAssetProvider.resolve({
            app:
              "wooly",
            role:
              "home-hero",
          }),
        ).toBeNull();
      },
    );

    it(
      "permite snapshots controlados",
      () => {
        const provider =
          createJungMediaWebAssetProvider(
            [],
          );

        expect(
          provider.resolve({
            app:
              "gleemour",
            role:
              "home-hero",
          }),
        ).toBeNull();
      },
    );
  },
);
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
      "resuelve home-hero desde JUNG Media",
      () => {
        const asset =
          jungMediaWebAssetProvider.resolve({
            app:
              "gleemour",
            role:
              "home-hero",
          });

        expect(asset).toMatchObject({
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
          width:
            832,
          height:
            912,
          status:
            "ACTIVE",
        });

        expect(
          asset?.checksumSha256,
        ).toBe(
          "11e154d4561a4218cf860a7218f9541e8cf1f23c25dff3d64c77b718f66aa40d",
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
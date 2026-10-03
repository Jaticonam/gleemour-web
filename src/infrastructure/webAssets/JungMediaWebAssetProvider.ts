import type {
  WebAssetDescriptor,
  WebAssetProvider,
} from "@/application/webAssets/WebAssetContract";

/**
 * Certified JUNG Media WEB snapshot for Gleemour.
 *
 * Physical Media infrastructure remains hidden.
 * Consumers receive only semantic WEB descriptors
 * and public delivery URLs.
 */
export const JUNG_MEDIA_GLEEMOUR_WEB_ASSETS:
  readonly WebAssetDescriptor[] = [
    {
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
      version:
        "public-v1",
      checksumSha256:
        "11e154d4561a4218cf860a7218f9541e8cf1f23c25dff3d64c77b718f66aa40d",
      status:
        "ACTIVE",
    },
  ];

export function createJungMediaWebAssetProvider(
  assets:
    readonly WebAssetDescriptor[] =
      JUNG_MEDIA_GLEEMOUR_WEB_ASSETS,
): WebAssetProvider {
  return {
    resolve(request) {
      return (
        assets.find(
          (asset) =>
            asset.status ===
              "ACTIVE" &&
            asset.app ===
              request.app &&
            asset.role ===
              request.role,
        ) ?? null
      );
    },
  };
}

export const jungMediaWebAssetProvider =
  createJungMediaWebAssetProvider();
import type {
  WebAssetDescriptor,
  WebAssetProvider,
} from "@/application/webAssets/WebAssetContract";

/**
 * Stable semantic bindings from Gleemour to JUNG Media WEB assets.
 *
 * Physical mutable metadata such as dimensions, checksum or
 * publication version remains owned by JUNG Media.
 *
 * Gleemour depends only on semantic identity and the stable
 * public delivery URL.
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
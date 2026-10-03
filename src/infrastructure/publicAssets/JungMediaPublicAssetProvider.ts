import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
} from "@/application/publicAssets/PublicAssetContract";

import {
  matchesPublicAssetRequest,
} from "@/application/publicAssets/PublicAssetResolver";

/**
 * Snapshot certificado de activos públicos entregados
 * por JUNG Media para Gleemour.
 *
 * Este provider expone únicamente el contrato semántico
 * public-assets.v1. No conoce ni expone buckets, storageKey,
 * filesystem, R2, incoming-public ni library-public.
 *
 * Los paths físicos de Media quedan encapsulados detrás
 * de publicUrl.
 */
export const JUNG_MEDIA_GLEEMOUR_PUBLIC_ASSETS:
  readonly PublicAssetDescriptor[] = [
    {
      assetId:
        "jung-media:gleemour:brand:logo-primary",
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
      version:
        "public-v1",
      checksumSha256:
        "54358a5826224d43f96fdb9068db4b2b2a546d84b7b78b177b143117245ac28a",
      status:
        "ACTIVE",
    },
    {
      assetId:
        "jung-media:gleemour:social:og-default",
      app:
        "gleemour",

      /*
       * JUNG Media stores this asset physically under /og/.
       * Gleemour consumes it semantically as scope "social".
       * This provider is the translation boundary.
       */
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
      version:
        "public-v1",
      checksumSha256:
        "667a3a5628f3d8b4f9d5ab569234c00a74d3e98d18b321242ea4288757d3ddd1",
      status:
        "ACTIVE",
    },
  ];

export function createJungMediaPublicAssetProvider(
  assets:
    readonly PublicAssetDescriptor[] =
      JUNG_MEDIA_GLEEMOUR_PUBLIC_ASSETS,
): PublicAssetProvider {
  return {
    resolve(request) {
      return (
        assets.find(
          (asset) =>
            asset.status ===
              "ACTIVE" &&
            matchesPublicAssetRequest(
              asset,
              request,
            ),
        ) ?? null
      );
    },
  };
}

export const jungMediaPublicAssetProvider =
  createJungMediaPublicAssetProvider();
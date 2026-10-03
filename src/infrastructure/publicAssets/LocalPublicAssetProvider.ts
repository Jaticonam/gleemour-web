import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
} from "@/application/publicAssets/PublicAssetContract";

import {
  matchesPublicAssetRequest,
} from "@/application/publicAssets/PublicAssetResolver";

import {
  LOCAL_PUBLIC_ASSETS,
} from "@/tenant/assets/publicAssets";

export function createLocalPublicAssetProvider(
  assets:
    readonly PublicAssetDescriptor[] =
      LOCAL_PUBLIC_ASSETS,
): PublicAssetProvider {
  return {
    resolve(request) {
      return (
        assets.find(
          (asset) =>
            asset.status === "ACTIVE" &&
            matchesPublicAssetRequest(
              asset,
              request,
            ),
        ) ?? null
      );
    },
  };
}

export const localPublicAssetProvider =
  createLocalPublicAssetProvider();
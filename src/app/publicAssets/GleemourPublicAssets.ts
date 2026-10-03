import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
  PublicAssetRequest,
  PublicAssetRole,
} from "@/application/publicAssets/PublicAssetContract";

import {
  resolvePublicAsset,
} from "@/application/publicAssets/PublicAssetResolver";

import {
  localPublicAssetProvider,
} from "@/infrastructure/publicAssets/LocalPublicAssetProvider";

export const GLEEMOUR_APP_ID =
  "gleemour" as const;

const DEFAULT_PUBLIC_ASSET_PROVIDERS:
  readonly PublicAssetProvider[] = [
    localPublicAssetProvider,
  ];

type GleemourPublicAssetRequest =
  Omit<PublicAssetRequest, "app">;

function brandFallbacks(
  role: PublicAssetRole,
): readonly PublicAssetRequest[] {
  if (
    role === "logo-light" ||
    role === "logo-dark"
  ) {
    return [
      {
        app: GLEEMOUR_APP_ID,
        scope: "brand",
        role: "logo-primary",
      },
    ];
  }

  return [];
}

/**
 * Application composition root for public assets.
 *
 * A10.5 will be able to prepend a JUNG Media provider here
 * without changing consumers in Home, Catalog or SEO.
 */
export function resolveGleemourPublicAsset(
  request: GleemourPublicAssetRequest,
  providers:
    readonly PublicAssetProvider[] =
      DEFAULT_PUBLIC_ASSET_PROVIDERS,
  fallbacks:
    readonly PublicAssetRequest[] = [],
): PublicAssetDescriptor | null {
  return resolvePublicAsset({
    request: {
      ...request,
      app: GLEEMOUR_APP_ID,
    },
    providers,
    fallbacks,
  });
}

export function resolveGleemourBrandAsset(
  role: PublicAssetRole,
  providers:
    readonly PublicAssetProvider[] =
      DEFAULT_PUBLIC_ASSET_PROVIDERS,
): PublicAssetDescriptor | null {
  return resolveGleemourPublicAsset(
    {
      scope: "brand",
      role,
    },
    providers,
    brandFallbacks(role),
  );
}

export function getGleemourBrandAssetUrl(
  role: PublicAssetRole,
  providers:
    readonly PublicAssetProvider[] =
      DEFAULT_PUBLIC_ASSET_PROVIDERS,
): string | null {
  return (
    resolveGleemourBrandAsset(
      role,
      providers,
    )?.publicUrl ?? null
  );
}
import type {
  WebAssetDescriptor,
  WebAssetProvider,
  WebAssetRequest,
  WebAssetRole,
} from "@/application/webAssets/WebAssetContract";

export const GLEEMOUR_WEB_APP_ID =
  "gleemour" as const;

let externalWebAssetProviders:
  readonly WebAssetProvider[] = [];

export function configureGleemourWebAssetProviders(
  providers:
    readonly WebAssetProvider[],
): void {
  externalWebAssetProviders = [
    ...providers,
  ];
}

function matchesRequest(
  asset: WebAssetDescriptor,
  request: WebAssetRequest,
): boolean {
  return (
    asset.app === request.app &&
    asset.role === request.role
  );
}

function isUsable(
  asset: WebAssetDescriptor,
): boolean {
  return (
    asset.status === "ACTIVE" &&
    asset.publicUrl.trim().length > 0
  );
}

/**
 * WEB assets are intentionally isolated from
 * public-assets.v1.
 *
 * Providers are synchronous snapshots. Transport,
 * R2 and Media internals remain outside Gleemour
 * consumers.
 */
export function resolveGleemourWebAsset(
  role: WebAssetRole,
  providers:
    readonly WebAssetProvider[] =
      externalWebAssetProviders,
): WebAssetDescriptor | null {
  const request: WebAssetRequest = {
    app: GLEEMOUR_WEB_APP_ID,
    role,
  };

  for (const provider of providers) {
    let asset:
      WebAssetDescriptor | null = null;

    try {
      asset =
        provider.resolve(request);
    } catch {
      continue;
    }

    if (!asset) {
      continue;
    }

    if (!isUsable(asset)) {
      continue;
    }

    if (!matchesRequest(asset, request)) {
      continue;
    }

    return asset;
  }

  return null;
}

export function getGleemourWebAssetUrl(
  role: WebAssetRole,
  providers?:
    readonly WebAssetProvider[],
): string | null {
  return (
    resolveGleemourWebAsset(
      role,
      providers,
    )?.publicUrl ?? null
  );
}
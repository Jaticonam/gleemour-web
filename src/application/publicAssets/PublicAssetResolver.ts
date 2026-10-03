import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
  PublicAssetRequest,
} from "./PublicAssetContract";

function sameOptional(
  left: string | undefined,
  right: string | undefined,
): boolean {
  return (left ?? "") === (right ?? "");
}

export function matchesPublicAssetRequest(
  asset: PublicAssetDescriptor,
  request: PublicAssetRequest,
): boolean {
  return (
    asset.app === request.app &&
    asset.scope === request.scope &&
    asset.role === request.role &&
    sameOptional(
      asset.entityType,
      request.entityType,
    ) &&
    sameOptional(
      asset.entityId,
      request.entityId,
    ) &&
    sameOptional(
      asset.preset,
      request.preset,
    )
  );
}

function isUsablePublicAsset(
  asset: PublicAssetDescriptor,
): boolean {
  return (
    asset.status === "ACTIVE" &&
    asset.publicUrl.trim().length > 0
  );
}

export interface ResolvePublicAssetInput {
  readonly request: PublicAssetRequest;
  readonly providers:
    readonly PublicAssetProvider[];
  readonly fallbacks?:
    readonly PublicAssetRequest[];
}

/**
 * Resolution is synchronous by design.
 *
 * Remote transport must load a manifest outside this
 * boundary and expose it later as a provider snapshot.
 *
 * Provider failures are fail-soft: the next provider
 * or semantic fallback may still resolve the asset.
 */
export function resolvePublicAsset(
  input: ResolvePublicAssetInput,
): PublicAssetDescriptor | null {
  const requests = [
    input.request,
    ...(input.fallbacks ?? []),
  ];

  for (const request of requests) {
    for (const provider of input.providers) {
      let asset: PublicAssetDescriptor | null =
        null;

      try {
        asset = provider.resolve(request);
      } catch {
        continue;
      }

      if (!asset) {
        continue;
      }

      if (!isUsablePublicAsset(asset)) {
        continue;
      }

      if (
        !matchesPublicAssetRequest(
          asset,
          request,
        )
      ) {
        continue;
      }

      return asset;
    }
  }

  return null;
}
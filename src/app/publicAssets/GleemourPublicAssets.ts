import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
  PublicAssetEntityType,
  PublicAssetRequest,
  PublicAssetRole,
} from "@/application/publicAssets/PublicAssetContract";

import {
  resolvePublicAsset,
} from "@/application/publicAssets/PublicAssetResolver";

import {
  localPublicAssetProvider,
} from "@/infrastructure/publicAssets/LocalPublicAssetProvider";

import {
  GLEEMOUR_SOCIAL_OG_PRESET,
} from "@/tenant/assets/publicAssets";

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
export type GleemourSocialAssetRole =
  | "og-default"
  | "og-category"
  | "og-campaign"
  | "og-product";

export interface GleemourSocialAssetInput {
  readonly role: GleemourSocialAssetRole;
  readonly entityType?: PublicAssetEntityType;
  readonly entityId?: string;
}

const SOCIAL_ENTITY_BY_ROLE:
  Partial<
    Record<
      GleemourSocialAssetRole,
      PublicAssetEntityType
    >
  > = {
    "og-category": "category",
    "og-campaign": "campaign",
    "og-product": "product",
  };

function socialFallbacks(
  role: GleemourSocialAssetRole,
): readonly PublicAssetRequest[] {
  if (role === "og-default") {
    return [];
  }

  return [
    {
      app: GLEEMOUR_APP_ID,
      scope: "social",
      role: "og-default",
      preset:
        GLEEMOUR_SOCIAL_OG_PRESET.id,
    },
  ];
}

function isValidSocialAssetInput(
  input: GleemourSocialAssetInput,
): boolean {
  if (input.role === "og-default") {
    return (
      input.entityType === undefined &&
      input.entityId === undefined
    );
  }

  const expectedEntity =
    SOCIAL_ENTITY_BY_ROLE[input.role];

  return (
    input.entityType === expectedEntity &&
    Boolean(input.entityId?.trim())
  );
}

export function resolveGleemourSocialAsset(
  input: GleemourSocialAssetInput,
  providers:
    readonly PublicAssetProvider[] =
      DEFAULT_PUBLIC_ASSET_PROVIDERS,
): PublicAssetDescriptor | null {
  if (!isValidSocialAssetInput(input)) {
    return null;
  }

  return resolveGleemourPublicAsset(
    {
      scope: "social",
      role: input.role,
      entityType: input.entityType,
      entityId: input.entityId,
      preset:
        GLEEMOUR_SOCIAL_OG_PRESET.id,
    },
    providers,
    socialFallbacks(input.role),
  );
}

export function getGleemourSocialAssetUrl(
  input: GleemourSocialAssetInput,
  providers:
    readonly PublicAssetProvider[] =
      DEFAULT_PUBLIC_ASSET_PROVIDERS,
): string | null {
  return (
    resolveGleemourSocialAsset(
      input,
      providers,
    )?.publicUrl ?? null
  );
}
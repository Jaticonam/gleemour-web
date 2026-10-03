import type {
  PublicAssetDescriptor,
} from "@/application/publicAssets/PublicAssetContract";

/**
 * Canonical public URLs currently owned by Gleemour.
 *
 * JUNG Media may override these through the provider chain,
 * but UI components must never hardcode physical asset URLs.
 */
export const GLEEMOUR_BRAND_ASSET_URLS = {
  logoPrimary:
    "https://gleemour.com/logo_color.png",
  favicon:
    "https://gleemour.com/favicon.ico",
} as const;

/**
 * Local provider catalog.
 *
 * Only real, known public assets belong here.
 * Missing variants are resolved semantically by the application
 * or remain unresolved until JUNG Media publishes them.
 */
export const LOCAL_PUBLIC_ASSETS:
  readonly PublicAssetDescriptor[] = [
    {
      assetId:
        "gleemour:brand:logo-primary",
      app: "gleemour",
      scope: "brand",
      role: "logo-primary",
      publicUrl:
        GLEEMOUR_BRAND_ASSET_URLS.logoPrimary,
      mimeType: "image/png",
      version: "brand-v1",
      status: "ACTIVE",
    },
    {
      assetId:
        "gleemour:brand:favicon",
      app: "gleemour",
      scope: "brand",
      role: "favicon",
      publicUrl:
        GLEEMOUR_BRAND_ASSET_URLS.favicon,
      mimeType: "image/x-icon",
      version: "legacy-v1",
      status: "ACTIVE",
    },
  ];
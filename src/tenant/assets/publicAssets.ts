import type {
  PublicAssetDescriptor,
} from "@/application/publicAssets/PublicAssetContract";

import {
  ASSETS_CONFIG,
} from "./assets";

/**
 * Transitional local catalog.
 *
 * A10.2 will replace legacy brand sources with
 * canonical assets. A10.3 will add canonical OG
 * assets. Physical Media paths never belong here.
 */
export const LOCAL_PUBLIC_ASSETS:
  readonly PublicAssetDescriptor[] = [
    {
      assetId:
        "gleemour:brand:logo-primary",
      app: "gleemour",
      scope: "brand",
      role: "logo-primary",
      publicUrl: ASSETS_CONFIG.logo,
      mimeType: "image/png",
      version: "legacy-v1",
      status: "ACTIVE",
    },
    {
      assetId:
        "gleemour:brand:favicon",
      app: "gleemour",
      scope: "brand",
      role: "favicon",
      publicUrl:
        "https://gleemour.com/favicon.ico",
      mimeType: "image/x-icon",
      version: "legacy-v1",
      status: "ACTIVE",
    },
  ];
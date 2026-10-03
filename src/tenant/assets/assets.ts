import {
  GLEEMOUR_BRAND_ASSET_URLS,
} from "./publicAssets";

/**
 * Compatibility facade for legacy consumers.
 *
 * New public UI must resolve brand assets through
 * the Public Asset Contract composition root.
 */
export const ASSETS_CONFIG = {
  logo:
    GLEEMOUR_BRAND_ASSET_URLS.logoPrimary,
} as const;
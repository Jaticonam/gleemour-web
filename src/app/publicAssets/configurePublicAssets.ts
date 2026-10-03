import type {
  PublicAssetProvider,
} from "@/application/publicAssets/PublicAssetContract";

import {
  configureGleemourExternalPublicAssetProviders,
} from "./GleemourPublicAssets";

/**
 * Bootstrap provider-neutral de activos públicos.
 *
 * JUNG Media conectará aquí su provider concreto
 * cuando esté disponible.
 */
export function configurePublicAssets(
  providers:
    readonly PublicAssetProvider[] = [],
): void {
  configureGleemourExternalPublicAssetProviders(
    providers,
  );
}
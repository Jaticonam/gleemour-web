import type {
  WebAssetProvider,
} from "@/application/webAssets/WebAssetContract";

import {
  configureGleemourWebAssetProviders,
} from "./GleemourWebAssets";

export function configureWebAssets(
  providers:
    readonly WebAssetProvider[] = [],
): void {
  configureGleemourWebAssetProviders(
    providers,
  );
}
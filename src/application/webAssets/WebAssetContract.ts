export const WEB_ASSET_SCHEMA_VERSION =
  "web-assets.v1" as const;

export type WebAssetRole =
  | "home-hero";

export type WebAssetStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface WebAssetRequest {
  readonly app: string;
  readonly role: WebAssetRole;
}

export interface WebAssetDescriptor {
  readonly assetId: string;
  readonly app: string;
  readonly role: WebAssetRole;

  readonly publicUrl: string;
  readonly mimeType: string;

  readonly width?: number;
  readonly height?: number;

  readonly version?: string;
  readonly checksumSha256?: string;
  readonly updatedAt?: string;

  readonly status: WebAssetStatus;
}

export interface WebAssetProvider {
  resolve(
    request: WebAssetRequest,
  ): WebAssetDescriptor | null;
}
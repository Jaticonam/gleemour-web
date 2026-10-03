export const PUBLIC_ASSET_SCHEMA_VERSION =
  "public-assets.v1" as const;

export type PublicAssetScope =
  | "brand"
  | "social";

export type PublicAssetRole =
  | "logo-primary"
  | "logo-light"
  | "logo-dark"
  | "symbol"
  | "favicon"
  | "app-icon"
  | "og-default"
  | "og-category"
  | "og-campaign"
  | "og-product";

export type PublicAssetEntityType =
  | "category"
  | "campaign"
  | "product";

export type PublicAssetStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface PublicAssetRequest {
  readonly app: string;
  readonly scope: PublicAssetScope;
  readonly role: PublicAssetRole;
  readonly entityType?: PublicAssetEntityType;
  readonly entityId?: string;
  readonly preset?: string;
}

export interface PublicAssetDescriptor {
  readonly assetId: string;
  readonly app: string;
  readonly scope: PublicAssetScope;
  readonly role: PublicAssetRole;

  readonly entityType?: PublicAssetEntityType;
  readonly entityId?: string;
  readonly preset?: string;

  readonly publicUrl: string;
  readonly mimeType: string;

  readonly width?: number;
  readonly height?: number;

  readonly version?: string;
  readonly checksumSha256?: string;
  readonly updatedAt?: string;

  readonly status: PublicAssetStatus;
}

export interface PublicAssetManifest {
  readonly schemaVersion:
    typeof PUBLIC_ASSET_SCHEMA_VERSION;

  readonly app: string;
  readonly generatedAt: string;
  readonly assets:
    readonly PublicAssetDescriptor[];
}

export interface PublicAssetProvider {
  resolve(
    request: PublicAssetRequest,
  ): PublicAssetDescriptor | null;
}
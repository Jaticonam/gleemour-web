import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
  PublicAssetRequest,
} from "./PublicAssetContract";

import {
  resolvePublicAsset,
} from "./PublicAssetResolver";

const productRequest: PublicAssetRequest = {
  app: "gleemour",
  scope: "social",
  role: "og-product",
  entityType: "product",
  entityId: "GLE-001",
  preset: "social-og-v1",
};

const defaultRequest: PublicAssetRequest = {
  app: "gleemour",
  scope: "social",
  role: "og-default",
  preset: "social-og-v1",
};

function descriptor(
  overrides:
    Partial<PublicAssetDescriptor> = {},
): PublicAssetDescriptor {
  return {
    assetId:
      "gleemour:social:og-product:GLE-001",
    app: "gleemour",
    scope: "social",
    role: "og-product",
    entityType: "product",
    entityId: "GLE-001",
    preset: "social-og-v1",
    publicUrl:
      "https://media.test/GLE-001.jpg",
    mimeType: "image/jpeg",
    width: 1200,
    height: 630,
    version: "v1",
    status: "ACTIVE",
    ...overrides,
  };
}

describe("resolvePublicAsset", () => {
  it("respeta la precedencia de providers para un match exacto", () => {
    const mediaAsset = descriptor({
      publicUrl:
        "https://media.jung.test/GLE-001.jpg",
    });

    const localAsset = descriptor({
      publicUrl:
        "https://gleemour.test/GLE-001.jpg",
    });

    const mediaProvider: PublicAssetProvider = {
      resolve: vi.fn(() => mediaAsset),
    };

    const localProvider: PublicAssetProvider = {
      resolve: vi.fn(() => localAsset),
    };

    const result = resolvePublicAsset({
      request: productRequest,
      providers: [
        mediaProvider,
        localProvider,
      ],
    });

    expect(result).toBe(mediaAsset);
    expect(
      localProvider.resolve,
    ).not.toHaveBeenCalled();
  });

  it("ignora INACTIVE y continúa con el siguiente provider", () => {
    const inactiveProvider:
      PublicAssetProvider = {
        resolve: vi.fn(() =>
          descriptor({
            status: "INACTIVE",
          }),
        ),
      };

    const localAsset = descriptor({
      publicUrl:
        "https://gleemour.test/GLE-001.jpg",
    });

    const localProvider: PublicAssetProvider = {
      resolve: vi.fn(() => localAsset),
    };

    const result = resolvePublicAsset({
      request: productRequest,
      providers: [
        inactiveProvider,
        localProvider,
      ],
    });

    expect(result).toBe(localAsset);
  });

  it("aplica fallback semántico solo después de agotar el match exacto", () => {
    const fallbackAsset = descriptor({
      assetId:
        "gleemour:social:og-default",
      role: "og-default",
      entityType: undefined,
      entityId: undefined,
      publicUrl:
        "https://gleemour.test/og-default.jpg",
    });

    const provider: PublicAssetProvider = {
      resolve: vi.fn((request) => {
        if (request.role === "og-default") {
          return fallbackAsset;
        }

        return null;
      }),
    };

    const result = resolvePublicAsset({
      request: productRequest,
      fallbacks: [defaultRequest],
      providers: [provider],
    });

    expect(result).toBe(fallbackAsset);
    expect(provider.resolve).toHaveBeenCalledTimes(2);
  });

  it("ignora un descriptor que no corresponde a la solicitud", () => {
    const provider: PublicAssetProvider = {
      resolve: vi.fn(() =>
        descriptor({
          entityId: "OTRO-SKU",
        }),
      ),
    };

    const result = resolvePublicAsset({
      request: productRequest,
      providers: [provider],
    });

    expect(result).toBeNull();
  });

  it("es fail-soft si un provider falla", () => {
    const failingProvider:
      PublicAssetProvider = {
        resolve: vi.fn(() => {
          throw new Error(
            "Provider unavailable",
          );
        }),
      };

    const localAsset = descriptor();

    const localProvider: PublicAssetProvider = {
      resolve: vi.fn(() => localAsset),
    };

    const result = resolvePublicAsset({
      request: productRequest,
      providers: [
        failingProvider,
        localProvider,
      ],
    });

    expect(result).toBe(localAsset);
  });
});
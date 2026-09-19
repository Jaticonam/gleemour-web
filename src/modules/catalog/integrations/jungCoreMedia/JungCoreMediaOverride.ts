import type { Product } from "@/shared/types/product";

interface CoreMediaAsset {
  readonly sku?: unknown;
  readonly url?: unknown;
  readonly position?: unknown;
  readonly isPrimary?: unknown;
}

const DEFAULT_CORE_URL =
  "http://localhost:3000/assets/manifest";

const REQUEST_TIMEOUT_MS = 2_000;

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePosition(value: unknown): number {
  const position = Number(value);

  return Number.isFinite(position)
    ? position
    : Number.MAX_SAFE_INTEGER;
}

function isActiveOrUnspecified(value: unknown): boolean {
  const status = cleanText(value).toUpperCase();

  return status.length === 0 || status === "ACTIVE";
}

function projectAsset(value: unknown): CoreMediaAsset[] {
  if (!isRecord(value)) {
    return [];
  }

  const directSku = cleanText(value.sku);
  const directUrl = cleanText(value.url);

  if (directSku || directUrl) {
    return [
      {
        sku: value.sku,
        url: value.url,
        position: value.position,
        isPrimary: value.isPrimary,
      },
    ];
  }

  const publicUrl = cleanText(value.publicUrl);

  if (
    !publicUrl ||
    !isActiveOrUnspecified(value.status) ||
    !Array.isArray(value.products)
  ) {
    return [];
  }

  return value.products.flatMap(
    (relation): CoreMediaAsset[] => {
      if (
        !isRecord(relation) ||
        !isRecord(relation.product)
      ) {
        return [];
      }

      const sku =
        cleanText(relation.product.sku);

      if (
        !sku ||
        !isActiveOrUnspecified(
          relation.product.status,
        )
      ) {
        return [];
      }

      return [
        {
          sku,
          url: publicUrl,
          position: relation.position,
          isPrimary: relation.isPrimary,
        },
      ];
    },
  );
}

function projectPublicSkuPayload(
  payload: Record<string, unknown>,
): CoreMediaAsset[] {
  if (!isRecord(payload.data)) {
    return [];
  }

  const sku =
    cleanText(payload.data.sku);

  if (
    !sku ||
    !Array.isArray(payload.data.mediaAssets)
  ) {
    return [];
  }

  return payload.data.mediaAssets.flatMap(
    (item): CoreMediaAsset[] => {
      if (!isRecord(item)) {
        return [];
      }

      const url =
        cleanText(item.url);

      if (!url) {
        return [];
      }

      return [
        {
          sku,
          url,
          position: item.position,
          isPrimary: item.isPrimary,
        },
      ];
    },
  );
}

function extractAssets(payload: unknown): CoreMediaAsset[] {
  if (Array.isArray(payload)) {
    return payload.flatMap(projectAsset);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const publicSkuAssets =
    projectPublicSkuPayload(payload);

  if (publicSkuAssets.length > 0) {
    return publicSkuAssets;
  }

  for (const candidate of [
    payload.assets,
    payload.items,
    payload.data,
  ]) {
    if (Array.isArray(candidate)) {
      return candidate.flatMap(projectAsset);
    }
  }

  return [];
}

function resolveCoreUrl(): string {
  const configured =
    cleanText(
      import.meta.env.VITE_JUNG_CORE_ASSETS_URL,
    );

  return configured || DEFAULT_CORE_URL;
}

function mediaForSku(
  assets: readonly CoreMediaAsset[],
  sku: string,
): string[] {
  const normalizedSku =
    cleanText(sku).toLowerCase();

  return assets
    .filter(
      (asset) =>
        cleanText(asset.sku).toLowerCase() ===
        normalizedSku,
    )
    .filter(
      (asset) =>
        Boolean(cleanText(asset.url)),
    )
    .sort((left, right) => {
      const primaryDelta =
        Number(Boolean(right.isPrimary)) -
        Number(Boolean(left.isPrimary));

      if (primaryDelta !== 0) {
        return primaryDelta;
      }

      return (
        normalizePosition(left.position) -
        normalizePosition(right.position)
      );
    })
    .map(
      (asset) =>
        cleanText(asset.url),
    )
    .filter(
      (url, index, urls) =>
        urls.indexOf(url) === index,
    );
}

export function applyCoreMediaAssets(
  products: readonly Product[],
  payload: unknown,
): Product[] {
  const assets =
    extractAssets(payload);

  if (assets.length === 0) {
    return [...products];
  }

  return products.map((product) => {
    const media =
      mediaForSku(
        assets,
        product.id,
      );

    if (media.length === 0) {
      return product;
    }

    return {
      ...product,
      img:
        media[0] ?? product.img,
      images:
        media.slice(1),
    };
  });
}

export async function overrideProductsWithCoreMedia(
  products: readonly Product[],
): Promise<Product[]> {
  if (products.length === 0) {
    return [];
  }

  const controller =
    new AbortController();

  const timeout =
    globalThis.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

  try {
    const response =
      await fetch(
        resolveCoreUrl(),
        {
          cache: "no-store",
          signal: controller.signal,
        },
      );

    if (!response.ok) {
      console.warn(
        `[JUNG CORE media] HTTP ${response.status}. ` +
          "Se conserva media de Google Sheets.",
      );

      return [...products];
    }

    const payload: unknown =
      await response.json();

    return applyCoreMediaAssets(
      products,
      payload,
    );
  } catch (cause: unknown) {
    console.warn(
      "[JUNG CORE media] No disponible. " +
        "Se conserva media de Google Sheets.",
      cause,
    );

    return [...products];
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

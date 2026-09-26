import type { Product } from "@/shared/types/product";
import { isVisibleProductStatus } from "@/tenant/config/product/statuses";

export type CatalogCompositionMode =
  | "full"
  | "category"
  | "subcategory"
  | "campaign"
  | "custom";

export type CatalogSource =
  | { type: "all" }
  | { type: "category"; categoryId: string }
  | { type: "subcategory"; categoryId: string; subcategoryId: string }
  | { type: "campaign"; campaignId: string }
  | { type: "manual"; productIds: string[] };

export type CatalogSortMode =
  | "manual"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "priority";

export interface CatalogSettings {
  title: string;
}

export type CatalogLifecycleStatus = "draft" | "ready" | "published" | "archived";
export type CatalogCompositionStrategy = "dynamic" | "snapshot";

export interface CatalogCompositionSnapshot {
  productIds: string[];
  excludedProductIds: string[];
  order: string[];
}

/** Provider-neutral boundary for future CatalogVersion persistence in JUNG CORE. */
export interface CatalogDraftContract {
  catalogId?: string;
  version?: number;
  status: "draft";
  compositionStrategy: CatalogCompositionStrategy;
  source: CatalogSource;
  composition: CatalogCompositionSnapshot;
  settings: CatalogSettings;
}

export interface CatalogCompositionDraft {
  mode: CatalogCompositionMode;
  settings: CatalogSettings;
  categoryId: string;
  subcategoryId: string;
  campaignId: string;
  customProductIds: string[];
  orderedProductIds: string[];
  manuallyExcludedProductIds: string[];
  sortMode: CatalogSortMode;
}

export interface CatalogCompositionResult {
  candidates: Product[];
  included: Product[];
  automaticExcluded: Product[];
  manuallyExcluded: Product[];
  /** @deprecated Use automaticExcluded. */
  excluded: Product[];
}

export function createCatalogCompositionDraft(
  customProductIds: readonly string[] = [],
): CatalogCompositionDraft {
  return {
    mode: customProductIds.length > 0 ? "custom" : "full",
    settings: { title: "Catálogo Gleemour" },
    categoryId: "",
    subcategoryId: "",
    campaignId: "",
    customProductIds: [...new Set(customProductIds)],
    orderedProductIds: [],
    manuallyExcludedProductIds: [],
    sortMode: "manual",
  };
}

export function getCatalogSource(draft: CatalogCompositionDraft): CatalogSource {
  if (draft.mode === "full") return { type: "all" };
  if (draft.mode === "category") {
    return { type: "category", categoryId: draft.categoryId };
  }
  if (draft.mode === "subcategory") {
    return {
      type: "subcategory",
      categoryId: draft.categoryId,
      subcategoryId: draft.subcategoryId,
    };
  }
  if (draft.mode === "campaign") {
    return { type: "campaign", campaignId: draft.campaignId };
  }
  return { type: "manual", productIds: draft.customProductIds };
}

function matchesSource(product: Product, source: CatalogSource): boolean {
  if (source.type === "all") return true;

  if (source.type === "category") {
    return Boolean(source.categoryId) &&
      [product.category, ...(product.categories ?? [])].includes(source.categoryId);
  }

  if (source.type === "subcategory") {
    const matchesCategory = [
      product.category,
      ...(product.categories ?? []),
    ].includes(source.categoryId);

    return Boolean(source.categoryId && source.subcategoryId) &&
      matchesCategory &&
      (product.subcategories ?? []).includes(source.subcategoryId);
  }

  if (source.type === "campaign") {
    return Boolean(source.campaignId) &&
      (product.campaigns ?? []).includes(source.campaignId);
  }

  return source.productIds.includes(product.id);
}

export function resolveCatalogSource(
  products: readonly Product[],
  source: CatalogSource,
): Product[] {
  return products.filter((product) => matchesSource(product, source));
}

function orderProducts(
  products: readonly Product[],
  orderedProductIds: readonly string[],
): Product[] {
  const positions = new Map(
    orderedProductIds.map((productId, index) => [productId, index]),
  );

  return [...products].sort((left, right) => {
    const leftPosition = positions.get(left.id);
    const rightPosition = positions.get(right.id);

    if (leftPosition !== undefined && rightPosition !== undefined) {
      return leftPosition - rightPosition;
    }

    if (leftPosition !== undefined) return -1;
    if (rightPosition !== undefined) return 1;

    return right.priority - left.priority;
  });
}

function getPrice(product: Product): number {
  return product.offer_price ?? product.price;
}

function sortProducts(
  products: readonly Product[],
  draft: CatalogCompositionDraft,
): Product[] {
  if (draft.sortMode === "manual") {
    return orderProducts(products, draft.orderedProductIds);
  }

  return [...products].sort((left, right) => {
    if (draft.sortMode === "name-asc") return left.title.localeCompare(right.title, "es");
    if (draft.sortMode === "name-desc") return right.title.localeCompare(left.title, "es");
    if (draft.sortMode === "price-asc") return getPrice(left) - getPrice(right);
    if (draft.sortMode === "price-desc") return getPrice(right) - getPrice(left);
    return right.priority - left.priority;
  });
}

export function resolveCatalogComposition(
  products: readonly Product[],
  draft: CatalogCompositionDraft,
): CatalogCompositionResult {
  const candidates = resolveCatalogSource(products, getCatalogSource(draft));
  const automaticExcluded = candidates.filter(
    (product) => !isVisibleProductStatus(product.status),
  );
  const publicCandidates = candidates.filter((product) =>
    isVisibleProductStatus(product.status),
  );
  const manuallyExcluded = publicCandidates.filter((product) =>
    draft.manuallyExcludedProductIds.includes(product.id),
  );
  const included = sortProducts(
    publicCandidates.filter(
      (product) => !draft.manuallyExcludedProductIds.includes(product.id),
    ),
    draft,
  );

  return {
    candidates,
    included,
    automaticExcluded,
    manuallyExcluded,
    excluded: automaticExcluded,
  };
}

export function toCatalogDraftContract(
  draft: CatalogCompositionDraft,
  result: CatalogCompositionResult,
): CatalogDraftContract {
  const productIds = result.included.map((product) => product.id);

  return {
    status: "draft",
    compositionStrategy: "dynamic",
    source: getCatalogSource(draft),
    composition: {
      productIds,
      excludedProductIds: result.manuallyExcluded.map((product) => product.id),
      order: productIds,
    },
    settings: { ...draft.settings },
  };
}

export function moveProduct(
  orderedProductIds: readonly string[],
  productId: string,
  direction: "up" | "down",
): string[] {
  const next = [...orderedProductIds];
  const currentIndex = next.indexOf(productId);

  if (currentIndex === -1) return next;

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= next.length) return next;

  [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
  return next;
}

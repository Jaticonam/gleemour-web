import type { Product } from "@/shared/types/product";
import { isVisibleProductStatus } from "@/tenant/config/product/statuses";

export type CatalogCompositionMode =
  | "full"
  | "category"
  | "subcategory"
  | "campaign"
  | "custom";

export interface CatalogCompositionDraft {
  mode: CatalogCompositionMode;
  title: string;
  categoryId: string;
  subcategoryId: string;
  campaignId: string;
  customProductIds: string[];
  orderedProductIds: string[];
}

export interface CatalogCompositionResult {
  candidates: Product[];
  included: Product[];
  excluded: Product[];
}

export function createCatalogCompositionDraft(
  customProductIds: readonly string[] = [],
): CatalogCompositionDraft {
  return {
    mode: customProductIds.length > 0 ? "custom" : "full",
    title: "Catálogo Gleemour",
    categoryId: "",
    subcategoryId: "",
    campaignId: "",
    customProductIds: [...new Set(customProductIds)],
    orderedProductIds: [],
  };
}

function matchesDraft(product: Product, draft: CatalogCompositionDraft): boolean {
  if (draft.mode === "full") return true;

  if (draft.mode === "category") {
    return Boolean(draft.categoryId) &&
      [product.category, ...(product.categories ?? [])].includes(draft.categoryId);
  }

  if (draft.mode === "subcategory") {
    const matchesCategory = [
      product.category,
      ...(product.categories ?? []),
    ].includes(draft.categoryId);

    return Boolean(draft.categoryId && draft.subcategoryId) &&
      matchesCategory &&
      (product.subcategories ?? []).includes(draft.subcategoryId);
  }

  if (draft.mode === "campaign") {
    return Boolean(draft.campaignId) &&
      (product.campaigns ?? []).includes(draft.campaignId);
  }

  return draft.customProductIds.includes(product.id);
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

export function resolveCatalogComposition(
  products: readonly Product[],
  draft: CatalogCompositionDraft,
): CatalogCompositionResult {
  const candidates = products.filter((product) => matchesDraft(product, draft));
  const included = orderProducts(
    candidates.filter((product) => isVisibleProductStatus(product.status)),
    draft.orderedProductIds,
  );
  const excluded = candidates.filter(
    (product) => !isVisibleProductStatus(product.status),
  );

  return { candidates, included, excluded };
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

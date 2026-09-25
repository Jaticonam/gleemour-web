import type { Product } from "@/shared/types/product";

export const ALL_ADMIN_FILTERS = "all";

export type ProductQuickFilter =
  | typeof ALL_ADMIN_FILTERS
  | "preparation"
  | "without-stock";

export interface ProductExplorerFilters {
  query: string;
  status: string;
  category: string;
  quickFilter?: ProductQuickFilter;
}

export interface ProductExplorerStats {
  total: number;
  published: number;
  preparation: number;
  withoutStock: number;
}

function normalizeSearchValue(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesQuery(product: Product, query: string): boolean {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) return true;

  const searchable = [
    product.id,
    product.title,
    product.description,
    product.status,
    product.category,
    ...(product.badges ?? []),
    ...(product.categories ?? []),
  ]
    .map(normalizeSearchValue)
    .join(" ");

  return searchable.includes(normalizedQuery);
}

function matchesStatus(product: Product, status: string): boolean {
  return (
    status === ALL_ADMIN_FILTERS ||
    normalizeSearchValue(product.status) === normalizeSearchValue(status)
  );
}

function matchesCategory(product: Product, category: string): boolean {
  if (category === ALL_ADMIN_FILTERS) return true;

  return [product.category, ...(product.categories ?? [])].includes(category);
}

function matchesQuickFilter(
  product: Product,
  quickFilter: ProductQuickFilter = ALL_ADMIN_FILTERS,
): boolean {
  const status = normalizeSearchValue(product.status);

  if (quickFilter === "preparation") {
    return status === "borrador" || status === "oculto";
  }

  if (quickFilter === "without-stock") {
    return status === "agotado" || product.stock === 0;
  }

  return true;
}

export function filterAdminProducts(
  products: readonly Product[],
  filters: ProductExplorerFilters,
): Product[] {
  return products.filter(
    (product) =>
      matchesQuery(product, filters.query) &&
      matchesStatus(product, filters.status) &&
      matchesCategory(product, filters.category) &&
      matchesQuickFilter(product, filters.quickFilter),
  );
}

export function getProductExplorerStats(
  products: readonly Product[],
): ProductExplorerStats {
  return products.reduce<ProductExplorerStats>(
    (stats, product) => {
      const status = normalizeSearchValue(product.status);

      stats.total += 1;
      stats.published += Number(status === "publicado");
      stats.preparation += Number(status === "borrador" || status === "oculto");
      stats.withoutStock += Number(
        status === "agotado" || product.stock === 0,
      );

      return stats;
    },
    {
      total: 0,
      published: 0,
      preparation: 0,
      withoutStock: 0,
    },
  );
}

export function getAdminStatusClassName(status: string): string {
  const normalized = normalizeSearchValue(status).replace(/\s+/g, "-");

  return normalized || "sin-estado";
}

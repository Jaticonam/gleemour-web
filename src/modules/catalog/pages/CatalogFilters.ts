import { getProductPrice, getProductState, isProductAvailable } from "@/domain/product";
import type { Product } from "@/shared/types/product";

export type DiscoverKey = "nuevo" | "premium" | "last-units";

export const DISCOVER_OPTIONS: ReadonlyArray<{ id: DiscoverKey; name: string }> = [
  { id: "nuevo", name: "Nuevos" },
  { id: "premium", name: "Premium" },
  { id: "last-units", name: "Últimas unidades" },
];

export function normalizeFilterKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeCampaignKey(value: unknown): string {
  const normalized = normalizeFilterKey(value);
  if (!normalized) return "";

  const stopWords = new Set(["de", "del", "la", "el", "las", "los", "al"]);
  return normalized.split("-").filter((part) => part && !stopWords.has(part)).join("-");
}

export function matchesDiscover(product: Product, key: DiscoverKey): boolean {
  if (key === "last-units") {
    return getProductState(product).type === "last-units";
  }

  const badges = product.badges ?? [];
  if (key === "nuevo") {
    return badges.some((badge) => normalizeFilterKey(badge) === "nuevo");
  }

  return badges.some((badge) => normalizeFilterKey(badge) === "premium") ||
    (product.attributes ?? []).some((attribute) => normalizeFilterKey(attribute) === "premium");
}

export function getAvailableDiscoverOptions(products: Product[]) {
  return DISCOVER_OPTIONS.filter((option) =>
    products.some((product) => matchesDiscover(product, option.id)),
  );
}

export interface CatalogFilterState {
  searchQuery: string;
  activeCampaign: string;
  activeCategory: string;
  activeDiscover: DiscoverKey | "";
  purchase?: PurchaseFilters;
}

export interface PurchaseFilters {
  minPrice: string;
  maxPrice: string;
  availability: "all" | "available" | "last-units";
  subcategory: string;
}

export const EMPTY_PURCHASE_FILTERS: PurchaseFilters = {
  minPrice: "", maxPrice: "", availability: "all", subcategory: "",
};

export type CatalogSort = "featured" | "price-asc" | "price-desc";

export function getAvailableSubcategories(products: Product[]): string[] {
  const labels = new Map<string, string>();
  products.forEach((product) => (product.subcategories ?? []).forEach((label) => {
    const key = normalizeFilterKey(label);
    if (key && !labels.has(key)) labels.set(key, label);
  }));
  return [...labels.values()].sort((a, b) => a.localeCompare(b, "es"));
}

function validPrice(product: Product): number | null {
  const price = getProductPrice(product);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export function sortCatalogProducts(products: Product[], sort: CatalogSort): Product[] {
  if (sort === "featured") return products; // loadAllProducts ya ordena por priority.
  return [...products].sort((left, right) => {
    const a = validPrice(left);
    const b = validPrice(right);
    if (a === null) return b === null ? 0 : 1;
    if (b === null) return -1;
    return sort === "price-asc" ? a - b : b - a;
  });
}

export function filterCatalogProducts(products: Product[], filters: CatalogFilterState): Product[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const campaign = normalizeCampaignKey(filters.activeCampaign);

  return products.filter((product) => {
    const productCampaigns = Array.isArray(product.campaigns) ? product.campaigns : [];
    if (campaign && !productCampaigns.map(normalizeCampaignKey).includes(campaign)) return false;

    const categories = Array.isArray(product.categories) ? product.categories : [];
    if (filters.activeCategory !== "todas" &&
      product.category !== filters.activeCategory &&
      !categories.includes(filters.activeCategory)) return false;

    if (filters.activeDiscover && !matchesDiscover(product, filters.activeDiscover)) return false;

    const purchase = filters.purchase;
    if (purchase) {
      if (purchase.availability === "available" && !isProductAvailable(product)) return false;
      if (purchase.availability === "last-units" && !matchesDiscover(product, "last-units")) return false;
      if (purchase.subcategory && !(product.subcategories ?? []).some(
        (label) => normalizeFilterKey(label) === normalizeFilterKey(purchase.subcategory),
      )) return false;

      if (purchase.minPrice !== "" || purchase.maxPrice !== "") {
        const price = validPrice(product);
        if (price === null) return false;
        if (purchase.minPrice !== "" && price < Number(purchase.minPrice)) return false;
        if (purchase.maxPrice !== "" && price > Number(purchase.maxPrice)) return false;
      }
    }
    if (!query) return true;

    const haystack = [
      product.id, product.title, product.description, product.category,
      product.occasion, product.message, product.highlight,
      ...(product.badges ?? []), ...productCampaigns,
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

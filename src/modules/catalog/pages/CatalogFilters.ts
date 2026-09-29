import { getProductState } from "@/domain/product";
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
    if (!query) return true;

    const haystack = [
      product.id, product.title, product.description, product.category,
      product.occasion, product.message, product.highlight,
      ...(product.badges ?? []), ...productCampaigns,
    ].filter(Boolean).join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

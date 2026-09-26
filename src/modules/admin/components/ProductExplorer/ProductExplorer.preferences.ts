import {
  DEFAULT_PRODUCT_COLUMNS,
  PRODUCT_FIELDS,
  type ProductFieldKey,
  type ProductSortState,
} from "./ProductExplorer.fields";

export type ProductViewMode = "rows" | "table";
export type ProductDensity = "comfortable" | "compact";

export interface ProductExplorerPreferences {
  viewMode: ProductViewMode;
  density: ProductDensity;
  visibleColumns: ProductFieldKey[];
  sort: ProductSortState;
}

export const PRODUCT_EXPLORER_PREFERENCES_KEY = "gleemour.admin.product-explorer.v1";
export const DEFAULT_PRODUCT_EXPLORER_PREFERENCES: ProductExplorerPreferences = {
  viewMode: "rows",
  density: "comfortable",
  visibleColumns: [...DEFAULT_PRODUCT_COLUMNS],
  sort: { field: "priority", direction: "desc" },
};

const VALID_FIELDS = new Set(PRODUCT_FIELDS.map((field) => field.key));
const SORTABLE_FIELDS = new Set(
  PRODUCT_FIELDS.filter((field) => field.sortable).map((field) => field.key),
);

export function readProductExplorerPreferences(storage?: Pick<Storage, "getItem">): ProductExplorerPreferences {
  if (!storage) return DEFAULT_PRODUCT_EXPLORER_PREFERENCES;
  try {
    const raw = storage.getItem(PRODUCT_EXPLORER_PREFERENCES_KEY);
    if (!raw) return DEFAULT_PRODUCT_EXPLORER_PREFERENCES;
    const saved = JSON.parse(raw) as Partial<ProductExplorerPreferences>;
    const visibleColumns = Array.isArray(saved.visibleColumns)
      ? saved.visibleColumns.filter((key): key is ProductFieldKey => VALID_FIELDS.has(key as ProductFieldKey))
      : [...DEFAULT_PRODUCT_COLUMNS];
    return {
      viewMode: saved.viewMode === "table" ? "table" : "rows",
      density: saved.density === "compact" ? "compact" : "comfortable",
      visibleColumns,
      sort: saved.sort &&
        SORTABLE_FIELDS.has(saved.sort.field) &&
        (saved.sort.direction === "asc" || saved.sort.direction === "desc")
        ? saved.sort
        : DEFAULT_PRODUCT_EXPLORER_PREFERENCES.sort,
    };
  } catch {
    return DEFAULT_PRODUCT_EXPLORER_PREFERENCES;
  }
}

export function writeProductExplorerPreferences(
  preferences: ProductExplorerPreferences,
  storage?: Pick<Storage, "setItem">,
) {
  storage?.setItem(PRODUCT_EXPLORER_PREFERENCES_KEY, JSON.stringify(preferences));
}

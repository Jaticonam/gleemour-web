import type { Product } from "@/shared/types/product";
import { getCategoryName } from "@/tenant/config/catalog";

export type ProductFieldGroup = "commercial" | "classification" | "system";
export type ProductFieldType = "text" | "currency" | "number" | "list" | "image" | "date";
export type ProductFieldKey =
  | "img"
  | "id"
  | "title"
  | "status"
  | "price"
  | "offer_price"
  | "stock"
  | "category"
  | "priority"
  | "subcategories"
  | "campaigns"
  | "badges"
  | "updated_at";

export interface ProductFieldDefinition {
  key: ProductFieldKey;
  label: string;
  group: ProductFieldGroup;
  type: ProductFieldType;
  sortable: boolean;
  visibleByDefault: boolean;
  width: number;
  align?: "start" | "end" | "center";
}

export const PRODUCT_FIELD_GROUP_LABELS: Record<ProductFieldGroup, string> = {
  commercial: "Comercial",
  classification: "Clasificación",
  system: "Sistema",
};

export const PRODUCT_FIELDS: readonly ProductFieldDefinition[] = [
  { key: "id", label: "Código", group: "commercial", type: "text", sortable: true, visibleByDefault: true, width: 120 },
  { key: "title", label: "Producto", group: "commercial", type: "text", sortable: true, visibleByDefault: true, width: 230 },
  { key: "img", label: "Imagen", group: "commercial", type: "image", sortable: false, visibleByDefault: true, width: 76, align: "center" },
  { key: "status", label: "Estado", group: "commercial", type: "text", sortable: true, visibleByDefault: true, width: 120 },
  { key: "price", label: "Precio", group: "commercial", type: "currency", sortable: true, visibleByDefault: true, width: 110, align: "end" },
  { key: "offer_price", label: "Precio anterior", group: "commercial", type: "currency", sortable: true, visibleByDefault: false, width: 130, align: "end" },
  { key: "stock", label: "Stock", group: "commercial", type: "number", sortable: true, visibleByDefault: true, width: 90, align: "end" },
  { key: "badges", label: "Badges", group: "commercial", type: "list", sortable: false, visibleByDefault: false, width: 160 },
  { key: "category", label: "Categoría", group: "classification", type: "text", sortable: true, visibleByDefault: true, width: 160 },
  { key: "priority", label: "Prioridad", group: "classification", type: "number", sortable: true, visibleByDefault: true, width: 100, align: "end" },
  { key: "subcategories", label: "Subcategorías", group: "classification", type: "list", sortable: false, visibleByDefault: false, width: 170 },
  { key: "campaigns", label: "Campañas", group: "classification", type: "list", sortable: false, visibleByDefault: false, width: 170 },
  { key: "updated_at", label: "Actualizado", group: "system", type: "date", sortable: true, visibleByDefault: false, width: 150 },
] as const;

export const DEFAULT_PRODUCT_COLUMNS = PRODUCT_FIELDS.filter(
  (field) => field.visibleByDefault,
).map((field) => field.key);

const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function formatProductCurrency(value: number): string {
  return PEN_FORMATTER.format(value);
}

export function getProductActivePrice(product: Product): number {
  return product.offer_price && product.offer_price > 0
    ? product.offer_price
    : product.price;
}

export function getProductPreviousPrice(product: Product): number | null {
  return product.offer_price && product.offer_price > 0
    ? product.price
    : null;
}

export function getProductFieldValue(product: Product, key: ProductFieldKey): unknown {
  if (key === "category") return getCategoryName(product.category);
  if (key === "price") {
    return getProductActivePrice(product);
  }
  if (key === "offer_price") {
    return getProductPreviousPrice(product);
  }
  return product[key];
}

export function formatProductField(product: Product, field: ProductFieldDefinition): string {
  const value = getProductFieldValue(product, field.key);
  if (field.type === "currency") {
    return typeof value === "number" && value > 0 ? formatProductCurrency(value) : "—";
  }
  if (field.type === "list") {
    const values = Array.isArray(value) ? value.filter(Boolean) : [];
    if (values.length === 0) return "—";
    return values.length > 2 ? `${values.slice(0, 2).join(", ")} +${values.length - 2}` : values.join(", ");
  }
  if (field.type === "date") return value ? String(value) : "Sin fecha";
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export type ProductSortDirection = "asc" | "desc";
export interface ProductSortState {
  field: ProductFieldKey;
  direction: ProductSortDirection;
}

export function sortProducts(products: readonly Product[], sort: ProductSortState): Product[] {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...products].sort((left, right) => {
    const a = getProductFieldValue(left, sort.field);
    const b = getProductFieldValue(right, sort.field);
    if (a === b) return left.id.localeCompare(right.id, "es");
    if (a === null || a === undefined || a === "") return 1;
    if (b === null || b === undefined || b === "") return -1;
    if (typeof a === "number" && typeof b === "number") return (a - b) * direction;
    return String(a).localeCompare(String(b), "es", { sensitivity: "base", numeric: true }) * direction;
  });
}

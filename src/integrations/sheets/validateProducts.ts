import { CATEGORIES } from "@/tenant/config/catalog";
import { isVisibleProductStatus } from "@/tenant/config/product/statuses";
import type { SheetProduct } from "./normalizeProduct";

const CATEGORY_IDS = new Set(CATEGORIES.map((category) => category.id));
const FALLBACK_CATEGORY_ID = CATEGORIES[0]?.id ?? "";

function hasValidBasePrice(product: SheetProduct): boolean {
  return Number.isFinite(product.price) && product.price > 0;
}

function getInvalidCategories(product: SheetProduct): string[] {
  if (!product.category) return ["category vacío"];

  if (!product.categories || product.categories.length === 0) {
    return ["categories vacío"];
  }

  return product.categories.filter((categoryId) => !CATEGORY_IDS.has(categoryId));
}

function fixInvalidCategories(product: SheetProduct): void {
  const validCategories = (product.categories ?? []).filter((categoryId) =>
    CATEGORY_IDS.has(categoryId),
  );

  const hasValidPrimaryCategory =
    product.category && CATEGORY_IDS.has(product.category);

  if (hasValidPrimaryCategory) {
    product.categories = Array.from(
      new Set([product.category, ...validCategories].filter(Boolean)),
    );
    return;
  }

  if (validCategories.length > 0) {
    product.category = validCategories[0];
    product.categories = validCategories;
    return;
  }

  product.category = FALLBACK_CATEGORY_ID;
  product.categories = FALLBACK_CATEGORY_ID ? [FALLBACK_CATEGORY_ID] : [];
}

function hasInvalidOffer(product: SheetProduct): boolean {
  if (product.offer_price === null) return false;

  return (
    !Number.isFinite(product.offer_price) ||
    product.offer_price <= 0 ||
    product.offer_price >= product.price
  );
}

export function validateProducts(products: SheetProduct[]): SheetProduct[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const status = product.status.trim();

    if (!product.id) {
      console.warn("Producto descartado: sin id", product);
      return false;
    }

    if (seen.has(product.id)) {
      console.warn("Producto descartado: id duplicado ->", product.id);
      return false;
    }

    if (!product.title) {
      console.warn("Producto descartado: sin title ->", product.id);
      return false;
    }

    if (!isVisibleProductStatus(status)) {
      return false;
    }

    if (!hasValidBasePrice(product)) {
      console.warn("Producto descartado: precio base inválido ->", {
        id: product.id,
        title: product.title,
        price: product.price,
      });
      return false;
    }

    const invalidCategories = getInvalidCategories(product);

    if (invalidCategories.length > 0) {
      console.warn("Producto con categoría incompleta o inválida. Se aplica fallback ->", {
        id: product.id,
        title: product.title,
        category: product.category,
        categories: product.categories,
        invalidCategories,
        fallbackCategory: FALLBACK_CATEGORY_ID,
        validCategories: CATEGORIES.map((category) => category.sheetLabel),
      });

      fixInvalidCategories(product);
    }

    if (hasInvalidOffer(product)) {
      console.warn("Producto con oferta inválida. Se mantiene precio base ->", {
        id: product.id,
        title: product.title,
        price: product.price,
        offer_price: product.offer_price,
      });

      product.offer_price = null;
    }

    if (!product.img.trim()) {
      console.warn("Producto sin imagen. Se mantiene publicado, revisar ficha ->", {
        id: product.id,
        title: product.title,
      });
    }

    seen.add(product.id);
    return true;
  });
}
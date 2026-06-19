import { CATEGORIES } from "@/tenant/config/categories";
import { isVisibleProductStatus } from "@/tenant/config/statuses";
import type { SheetProduct } from "./normalizeProduct";

const CATEGORY_IDS = new Set(CATEGORIES.map((category) => category.id));

function hasValidBasePrice(product: SheetProduct): boolean {
  return Number.isFinite(product.price) && product.price > 0;
}

function hasValidImage(product: SheetProduct): boolean {
  return product.img.trim() !== "";
}

function getInvalidCategories(product: SheetProduct): string[] {
  if (!product.category) return ["category vacío"];
  if (!product.categories || product.categories.length === 0) {
    return ["categories vacío"];
  }

  return product.categories.filter((categoryId) => !CATEGORY_IDS.has(categoryId));
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

    const invalidCategories = getInvalidCategories(product);

    if (invalidCategories.length > 0) {
      console.warn("Producto descartado: categoría inválida ->", {
        id: product.id,
        title: product.title,
        category: product.category,
        categories: product.categories,
        invalidCategories,
        validCategories: CATEGORIES.map((category) => category.sheetLabel),
      });

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

    if (hasInvalidOffer(product)) {
      console.warn("Producto con oferta inválida. Se mantiene precio base ->", {
        id: product.id,
        title: product.title,
        price: product.price,
        offer_price: product.offer_price,
      });

      product.offer_price = null;
    }

    if (!hasValidImage(product)) {
      console.warn("Producto descartado: sin imagen ->", {
        id: product.id,
        title: product.title,
      });
      return false;
    }

    seen.add(product.id);
    return true;
  });
}



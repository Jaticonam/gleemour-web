import type { Product } from "@/shared/types/product";
import { isProductAvailable } from "@/domain/product/availability";

/**
 * Obtiene productos relacionados.
 *
 * Prioridad:
 * 1. Productos que comparten alguna categoría.
 * 2. Productos disponibles.
 * 3. Productos con mayor prioridad comercial.
 * 4. Productos de otras categorías como respaldo.
 */
export function getRelatedProducts(
  currentProduct: Product,
  products: Product[],
  limit = 4
): Product[] {
  const currentCategories = new Set(currentProduct.categories);

  const candidates = products.filter(
    (product) => product.id !== currentProduct.id
  );

  const sameCategoryProducts = candidates
    .filter((product) =>
      product.categories.some((categoryId) =>
        currentCategories.has(categoryId)
      )
    )
    .sort(sortByAvailabilityAndPriority);

  const fallbackProducts = candidates
    .filter(
      (product) =>
        !product.categories.some((categoryId) =>
          currentCategories.has(categoryId)
        )
    )
    .sort(sortByAvailabilityAndPriority);

  return [...sameCategoryProducts, ...fallbackProducts].slice(0, limit);
}

/**
 * Ordena primero disponibles y luego por prioridad comercial.
 */
function sortByAvailabilityAndPriority(a: Product, b: Product): number {
  const aAvailable = isProductAvailable(a);
  const bAvailable = isProductAvailable(b);

  if (aAvailable !== bAvailable) {
    return aAvailable ? -1 : 1;
  }

  return b.priority - a.priority;
}

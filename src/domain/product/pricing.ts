import type { Product } from "@/shared/types/product";

/**
 * Determina si un producto tiene una oferta válida.
 */
export function hasOfferPrice(product: Product): boolean {
  return (
    product.offer_price !== null &&
    Number.isFinite(product.offer_price) &&
    product.offer_price > 0 &&
    product.price > 0 &&
    product.offer_price < product.price
  );
}

/**
 * Devuelve el precio final de venta.
 * Si hay oferta válida, devuelve offer_price.
 */
export function getProductPrice(product: Product): number {
  return hasOfferPrice(product) ? Number(product.offer_price) : product.price;
}

/**
 * Devuelve el precio original.
 * Se usa para mostrar precio tachado cuando hay oferta.
 */
export function getOriginalProductPrice(product: Product): number {
  return product.price;
}

/**
 * Precio efectivo dentro del carrito.
 */
export function getEffectivePrice(item: Product & { qty: number }): number {
  return getProductPrice(item);
}

/**
 * Precio mínimo visible en cards, catálogo y búsquedas.
 */
export function getMinPrice(product: Product): number {
  return getProductPrice(product);
}



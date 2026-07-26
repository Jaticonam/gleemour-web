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
 * Si existe una oferta válida, devuelve offer_price.
 */
export function getProductPrice(product: Product): number {
  return hasOfferPrice(product)
    ? Number(product.offer_price)
    : product.price;
}

/**
 * Devuelve el precio original.
 * Se utiliza para mostrar el precio tachado cuando existe oferta.
 */
export function getOriginalProductPrice(product: Product): number {
  return product.price;
}

/**
 * Precio efectivo utilizado en carrito, detalle y pedidos.
 *
 * La cantidad pertenece al CartItem, pero no participa
 * en el cálculo unitario del modelo B2C de Gleemour.
 */
export function getEffectivePrice(product: Product): number {
  return getProductPrice(product);
}

/**
 * Precio mínimo visible en cards, catálogo y búsquedas.
 */
export function getMinPrice(product: Product): number {
  return getProductPrice(product);
}

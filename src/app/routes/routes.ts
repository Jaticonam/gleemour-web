import type { Product } from "@/shared/types/product";

/**
 * Rutas comerciales del catálogo.
 * Centraliza URLs para evitar rutas hardcodeadas en componentes.
 */

export function getCatalogUrl(): string {
  return "/catalogo";
}

export function getCategoryUrl(categoryId: string): string {
  return `/catalogo/categoria.html?cat=${encodeURIComponent(categoryId)}`;
}

export function getProductUrl(product: Product): string {
  const id = encodeURIComponent(product.id);
  const category = encodeURIComponent(product.category);

  return `/catalogo/producto.html?id=${id}&cat=${category}`;
}




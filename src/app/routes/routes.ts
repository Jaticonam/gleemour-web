import type { ExperienceSource } from "@/modules/experience/types/ExperienceEntry.types";
import type { Product } from "@/shared/types/product";

/**
 * Rutas comerciales del catálogo y Experience Studio.
 * Centraliza URLs para evitar rutas hardcodeadas en componentes.
 */

export function getCatalogUrl(): string {
  return "/catalogo";
}

export function getCategoryUrl(categoryId: string): string {
  return `/catalogo/categoria.html?cat=${encodeURIComponent(categoryId)}`;
}

export function getProductDetailUrl(
  productId: string,
  categoryId?: string,
): string {
  const params = new URLSearchParams({
    id: productId,
  });

  if (categoryId) {
    params.set("cat", categoryId);
  }

  return `/catalogo/producto.html?${params.toString()}`;
}

export function getProductUrl(product: Product): string {
  return getProductDetailUrl(product.id, product.category);
}

export function getExperienceUrl(
  source: ExperienceSource,
  productId?: string,
): string {
  const params = new URLSearchParams({
    origen: source,
  });

  if (source === "producto" && productId?.trim()) {
    params.set("producto", productId.trim());
  }

  return `/experiencia?${params.toString()}`;
}
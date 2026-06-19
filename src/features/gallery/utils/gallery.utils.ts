import type { Product } from "@/shared/types/product";

export function getGalleryImages(product: Product): string[] {
  const images = product.images?.filter(Boolean) ?? [];

  return Array.from(
    new Set(
      [product.img, ...images].filter(Boolean)
    )
  );
}



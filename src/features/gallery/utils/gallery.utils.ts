import type { Product } from "@/shared/types/product";

export function getProductImages(product: Product): string[] {
  const images = [
    product.img,
    ...(product.gallery ?? []),
  ].filter(Boolean);

  return Array.from(new Set(images));
}

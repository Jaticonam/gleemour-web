import type { Product } from "@/shared/types/product";

export function getProductImages(product: Product): string[] {
  const images = [
    product.img,
    ...(product.images ?? []),
  ].filter((image): image is string => Boolean(image));

  return Array.from(new Set(images));
}

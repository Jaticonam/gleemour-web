import { useMemo } from "react";

import {
  getEffectivePrice,
  getOriginalProductPrice,
  getProductState,
  getRelatedProducts,
  hasOfferPrice,
  isProductAvailable,
} from "@/domain/product";

import type { Product } from "@/shared/types/product";

export function useProductView(
  product: Product | undefined,
  products: Product[],
) {
  const available = product ? isProductAvailable(product) : false;

  const originalPrice = product ? getOriginalProductPrice(product) : 0;

  const finalPrice = product ? getEffectivePrice(product) : 0;

  const hasOffer = product ? hasOfferPrice(product) : false;

  const productState = product
    ? getProductState(product)
    : {
        type: "unavailable",
        label: "No disponible",
        available: false,
      };

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getRelatedProducts(product, products, 4);
  }, [product, products]);

  const productBadges = useMemo(() => {
    return product?.badges ?? [];
  }, [product]);

  return {
    available,
    originalPrice,
    finalPrice,
    hasOffer,
    productState,
    relatedProducts,
    productBadges,
  };
}

import { useEffect, useMemo, useState } from "react";

import { loadAllProducts } from "@/integrations/sheets/fetchSheets";

import {
  getEffectivePrice,
  getOriginalProductPrice,
  getProductState,
  getRelatedProducts,
  hasOfferPrice,
  isProductAvailable,
} from "@/domain/product";

import type { Product } from "@/shared/types/product";

interface UseProductDetailOptions {
  productId?: string;
  relatedLimit?: number;
}

export function useProductDetail({
  productId,
  relatedLimit = 4,
}: UseProductDetailOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadAllProducts().then((data) => {
      if (!mounted) return;

      setProducts(data);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const product = useMemo(() => {
    if (!productId) return undefined;

    return products.find((item) => item.id === productId);
  }, [products, productId]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return getRelatedProducts(product, products, relatedLimit);
  }, [product, products, relatedLimit]);

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

  return {
    products,
    product,
    loading,
    notFound: !loading && !product,
    relatedProducts,
    available,
    originalPrice,
    finalPrice,
    hasOffer,
    productState,
  };
}

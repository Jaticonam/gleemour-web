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

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeLookup(value: unknown): string {
  return safeDecode(cleanText(value))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function matchesProduct(product: Product, productId: string): boolean {
  const lookup = normalizeLookup(productId);

  if (!lookup) return false;

  const candidates = [
    product.id,
    normalizeLookup(product.id),
    product.title,
    normalizeLookup(product.title),
  ];

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeLookup(candidate);

    return normalizedCandidate === lookup;
  });
}

export function useProductDetail({
  productId,
  relatedLimit = 4,
}: UseProductDetailOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setLoadError(null);

    loadAllProducts()
      .then((data) => {
        if (!mounted) return;

        setProducts(data);
      })
      .catch((error) => {
        if (!mounted) return;

        console.error("Error cargando productos para ProductPage:", error);
        setProducts([]);
        setLoadError(error instanceof Error ? error : new Error(String(error)));
      })
      .finally(() => {
        if (!mounted) return;

        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const product = useMemo(() => {
    if (!productId) return undefined;

    const cleanProductId = cleanText(productId);

    return products.find((item) => matchesProduct(item, cleanProductId));
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
    loadError,
    notFound: !loading && !product,
    relatedProducts,
    available,
    originalPrice,
    finalPrice,
    hasOffer,
    productState,
  };
}
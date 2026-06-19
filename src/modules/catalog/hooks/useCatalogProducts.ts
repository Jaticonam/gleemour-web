import { useEffect, useMemo, useState } from "react";

import { productBelongsToCategory } from "@/domain/product/categories";
import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import { searchProducts } from "@/shared/lib/search";
import { sortByCommercialPriority } from "@/shared/lib/sort";
import type { Product } from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";

const TOP_PRIORITY = 100;
const STRONG_PRIORITY = 80;
const HIGHLIGHT_PRIORITY = 50;

export function useCatalogProducts(
  activeCategory: string,
  searchQuery: string,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim();

    if (activeCategory === "todas") {
      return term ? searchProducts(products, term) : products;
    }

    const categoryProducts = products.filter((product) =>
      productBelongsToCategory(product, activeCategory),
    );

    return term
      ? searchProducts(categoryProducts, term).length
        ? searchProducts(categoryProducts, term)
        : searchProducts(products, term)
      : categoryProducts;
  }, [products, activeCategory, searchQuery]);

  const visibleCategories = useMemo(() => {
    return BRAND_CONFIG.categories.filter((category) => {
      if (category.id === "todas" || category.id === "all") return true;

      return products.some((product) =>
        productBelongsToCategory(product, category.id),
      );
    });
  }, [products]);

  const showPriorityBlocks = activeCategory === "todas" && !searchQuery.trim();

  const topProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];

    return sortByCommercialPriority(
      products.filter((product) => (product.priority || 0) >= TOP_PRIORITY),
    );
  }, [products, showPriorityBlocks]);

  const strongProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];

    return sortByCommercialPriority(
      products.filter(
        (product) =>
          (product.priority || 0) >= STRONG_PRIORITY &&
          (product.priority || 0) < TOP_PRIORITY,
      ),
    );
  }, [products, showPriorityBlocks]);

  const highlightProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];

    return sortByCommercialPriority(
      products.filter(
        (product) =>
          (product.priority || 0) >= HIGHLIGHT_PRIORITY &&
          (product.priority || 0) < STRONG_PRIORITY,
      ),
    );
  }, [products, showPriorityBlocks]);

  const regularProducts = useMemo(() => {
    const items = showPriorityBlocks
      ? filteredProducts.filter(
          (product) => (product.priority || 0) < HIGHLIGHT_PRIORITY,
        )
      : filteredProducts;

    return sortByCommercialPriority(items);
  }, [filteredProducts, showPriorityBlocks]);

  return {
    products,
    loading,
    filteredProducts,
    visibleCategories,
    showPriorityBlocks,
    topProducts,
    strongProducts,
    highlightProducts,
    regularProducts,
  };
}



import "./CatalogProductGrid.css";
import type { Product } from "@/shared/types/product";

import { ProductCard } from "@/modules/catalog/components/product/ProductCard";

interface CatalogProductGridProps {
  products: Product[];
}

export function CatalogProductGrid({
  products,
}: CatalogProductGridProps) {
  return (
    <div className="catalog-grid" data-aos="fade-up" data-aos-delay="150">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

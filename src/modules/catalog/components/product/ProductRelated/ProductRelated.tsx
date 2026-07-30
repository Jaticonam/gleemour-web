import { ProductCard } from "../ProductCard";
import type { Product } from "@/shared/types/product";

import "./ProductRelated.css";

export interface ProductRelatedProps {
  title: string;
  description?: string;
  products: Product[];
}

export function ProductRelated({
  title,
  description,
  products,
}: ProductRelatedProps) {
  if (products.length === 0) return null;

  return (
    <section className="product-detail-related">
      <div className="product-detail-section-header">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>

      <div className="catalog-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}

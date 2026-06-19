import { ProductCard } from "@/modules/catalog/components/ProductCard";
import type { ProductRelatedProps } from "./ProductRelated.types";

export function ProductRelated({
  title,
  products,
  currentCategory,
}: ProductRelatedProps) {
  if (products.length === 0) return null;

  return (
    <section className="product-detail-related">
      <div className="product-detail-related-header">
        <h2>{title}</h2>
      </div>

      <div className="product-detail-related-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currentCategory={currentCategory}
          />
        ))}
      </div>
    </section>
  );
}

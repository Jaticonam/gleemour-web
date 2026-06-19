import { ProductCard } from "@/modules/catalog/components/ProductCard";
import type { Product } from "@/shared/types/product";
import type { CartItem } from "@/shared/types/product";

import "./ProductRelated.css";

export interface ProductRelatedProps {
  title: string;
  description?: string;
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onImageClick: (src: string, title: string) => void;
}

export function ProductRelated({
  title,
  description,
  products,
  cart,
  onAddToCart,
  onImageClick,
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
            cart={cart}
            onAddToCart={onAddToCart}
            onImageClick={onImageClick}
          />
        ))}
      </div>
    </section>
  );
}

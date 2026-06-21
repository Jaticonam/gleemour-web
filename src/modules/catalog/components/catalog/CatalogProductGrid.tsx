import "./CatalogProductGrid.css";
import type { Product } from "@/shared/types/product";
import type { CartItem } from "@/shared/types/product";

import { ProductCard } from "@/modules/catalog/components/product/ProductCard";

interface CatalogProductGridProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onImageClick: (src: string, title: string) => void;
}

export function CatalogProductGrid({
  products,
  cart,
  onAddToCart,
  onImageClick,
}: CatalogProductGridProps) {
  return (
    <div className="catalog-grid" data-aos="fade-up" data-aos-delay="150">
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
  );
}

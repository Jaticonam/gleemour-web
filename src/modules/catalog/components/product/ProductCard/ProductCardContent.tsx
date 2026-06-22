import { getEmotionalHint } from "@/domain/product/emotional";
import { getCategoryName } from "@/tenant/config/catalog";

import type { Product } from "@/shared/types/product";

interface ProductCardContentProps {
  product: Product;
}

export function ProductCardContent({ product }: ProductCardContentProps) {
  return (
    <>
      <div className="product-card-emotion">
        {getCategoryName(product.category)}
      </div>

      <h3 className="product-card-title">{product.title}</h3>

      <p className="product-card-hint">{getEmotionalHint(product)}</p>

      <p className="product-card-code">Ref. {product.id}</p>
    </>
  );
}

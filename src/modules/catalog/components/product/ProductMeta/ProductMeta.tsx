import { getCategoryName } from "@/tenant/config/catalog";
import type { Product } from "@/shared/types/product";

import "./ProductMeta.css";

interface ProductMetaProps {
  product: Product;
  productState: {
    label: string;
  };
  stockClass: string;
  StockIcon: React.ElementType;
}

export function ProductMeta({
  product,
  productState,
  stockClass,
  StockIcon,
}: ProductMetaProps) {
  return (
    <>
      <div className="product-detail-heading">
        <div className="product-detail-topline">
          <span className="product-detail-kicker">
            {getCategoryName(product.category)}
          </span>

          <span className="product-detail-code">Código: {product.id}</span>
        </div>

        <h1 className="product-detail-title">{product.title}</h1>
      </div>

      <div className="product-detail-meta-row">
        <div className={`product-detail-status ${stockClass}`}>
          <StockIcon className="w-4 h-4" />
          <span>{productState.label}</span>
        </div>
      </div>
    </>
  );
}

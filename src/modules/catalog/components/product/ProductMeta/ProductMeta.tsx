import { getCategoryName } from "@/tenant/config/catalog";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";
import type { Product } from "@/shared/types/product";

import "./ProductMeta.css";

interface ProductMetaProps {
  product: Product;
  available: boolean;
  viewers: number;
  productState: {
    label: string;
  };
  stockClass: string;
  StockIcon: React.ElementType;
}

export function ProductMeta({
  product,
  available,
  viewers,
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

          <span className="product-detail-code">{product.id}</span>
        </div>

        <h2 className="product-detail-title">{product.title}</h2>

        <p className="product-detail-description">
          {product.description || PRODUCT_DETAIL_CONFIG.description.fallback}
        </p>
      </div>

      <div className="product-detail-meta-row">
        <div className={`product-detail-status ${stockClass}`}>
          <StockIcon className="w-4 h-4" />
          <span>{productState.label}</span>
        </div>

        {available && (
          <div className="product-detail-viewers">
            <span />
            {viewers} viendo ahora
          </div>
        )}
      </div>
    </>
  );
}

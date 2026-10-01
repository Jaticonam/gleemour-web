import { getCategoryName } from "@/tenant/config/catalog";
import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

import type { Product } from "@/shared/types/product";

interface ProductCardContentProps {
  product: Product;
}

export function ProductCardContent({ product }: ProductCardContentProps) {
  const materialLabels = Array.from(
    new Set(
      product.attributes.flatMap((attribute) => {
        switch (attribute) {
          case "natural":
            return [PRODUCT_CARD_CONFIG.badges.attributes.natural];

          case "artificial":
            return [PRODUCT_CARD_CONFIG.badges.attributes.artificial];

          default:
            return [];
        }
      }),
    ),
  );

  return (
    <>
      <div className="product-card-meta">
        <span className="product-card-code">{product.id}</span>

        {materialLabels.length > 0 && (
          <>
            <span
              className="product-card-meta-separator"
              aria-hidden="true"
            >
              ·
            </span>

            <span className="product-card-material">
              {materialLabels.join(" · ")}
            </span>
          </>
        )}
      </div>

      <h3 className="product-card-title">
        {product.title}
      </h3>

      <div className="product-card-emotion">
        <span
          className="product-card-emotion-icon"
          aria-hidden="true"
        >
          ♡
        </span>

        <span>
          {getCategoryName(product.category)}
        </span>
      </div>
    </>
  );
}
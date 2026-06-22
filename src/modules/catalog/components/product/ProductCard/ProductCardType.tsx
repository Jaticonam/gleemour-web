import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

import type { Product } from "@/shared/types/product";

interface ProductCardTypeProps {
  attribute?: Product["attributes"][number];
}

export function ProductCardType({ attribute }: ProductCardTypeProps) {
  if (!attribute) return null;

  const label =
    PRODUCT_CARD_CONFIG.badges.attributes[
      attribute as keyof typeof PRODUCT_CARD_CONFIG.badges.attributes
    ];

  if (!label) return null;

  return (
    <div className="product-card-type-wrap">
      <span
        className={[
          "product-card-type-badge",
          `product-card-type-badge-${attribute}`,
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

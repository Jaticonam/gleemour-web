import { CheckCircle } from "lucide-react";

import { getBadgePresentation } from "@/tenant/config/product";
import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

import type { Product } from "@/shared/types/product";

interface ProductCardImageProps {
  product: Product;
  available: boolean;
  isPreventa: boolean;
  isInCart: boolean;
  qtyInCart: number;
  campaignBadge?: string;
  stateBadge?: string;
  onImageClick?: (src: string, title: string) => void;
}

export function ProductCardImage({
  product,
  available,
  isPreventa,
  isInCart,
  qtyInCart,
  campaignBadge,
  stateBadge,
  onImageClick,
}: ProductCardImageProps) {
  const statePresentation = stateBadge
    ? getBadgePresentation(stateBadge)
    : null;

  return (
    <div
      className="product-card-image-wrap"
      onClick={() => onImageClick?.(product.img, product.title)}
    >
      <img
        src={product.img || "/placeholder.svg"}
        alt={product.title}
        loading="lazy"
        className={[
          "product-card-image",
          !available && !isPreventa ? "product-card-image-disabled" : "",
        ].join(" ")}
      />

      <div className="product-card-image-overlay">
        <span>Ver detalle</span>
      </div>

      {(campaignBadge || stateBadge) && (
        <div className="product-card-badges product-card-badges-primary">
          {campaignBadge && (
            <span className="product-card-badge product-card-badge-campaign">
              {campaignBadge}
            </span>
          )}

          {stateBadge && statePresentation && (
            <span
              className={[
                "product-card-badge",
                "product-card-badge-state",
                statePresentation.className,
              ].join(" ")}
            >
              {statePresentation.icon} {statePresentation.label}
            </span>
          )}
        </div>
      )}

      {isInCart && (
        <div className="product-card-cart-badge">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>
            {qtyInCart} {PRODUCT_CARD_CONFIG.badges.inCartSuffix}
          </span>
        </div>
      )}
    </div>
  );
}

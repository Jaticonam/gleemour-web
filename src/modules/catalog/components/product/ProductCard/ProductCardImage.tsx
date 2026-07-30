import { getBadgePresentation } from "@/tenant/config/product";

import type { Product } from "@/shared/types/product";

interface ProductCardImageProps {
  product: Product;
  available: boolean;
  isPreventa: boolean;
  campaignBadge?: string;
  stateBadge?: string;
  onImageClick?: () => void;
}

export function ProductCardImage({
  product,
  available,
  isPreventa,
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
      onClick={onImageClick}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalle de ${product.title}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onImageClick?.();
        }
      }}
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
    </div>
  );
}

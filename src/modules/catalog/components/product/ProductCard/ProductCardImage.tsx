import { getBadgePresentation } from "@/tenant/config/product";
import { Link } from "react-router-dom";

import type { Product } from "@/shared/types/product";

interface ProductCardImageProps {
  product: Product;
  available: boolean;
  isPreventa: boolean;
  badge?: string;
  to: string;
}

export function ProductCardImage({
  product,
  available,
  isPreventa,
  badge,
  to,
}: ProductCardImageProps) {
  const badgePresentation = badge
    ? getBadgePresentation(badge)
    : null;

  return (
    <Link
      className="product-card-image-wrap"
      to={to}
      aria-label={`Ver detalle de ${product.title}`}
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

      {badge && badgePresentation && (
        <div className="product-card-badges product-card-badges-primary">
          <span className={["product-card-badge", badgePresentation.className].join(" ")}>
            {badgePresentation.icon} {badgePresentation.label}
          </span>
        </div>
      )}
    </Link>
  );
}

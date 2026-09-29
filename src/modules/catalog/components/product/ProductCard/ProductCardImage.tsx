import { getBadgePresentation } from "@/tenant/config/product";
import { Link } from "react-router-dom";
import { useState } from "react";

import type { Product } from "@/shared/types/product";

interface ProductCardImageProps {
  product: Product;
  available: boolean;
  isPreventa: boolean;
  badge?: string;
  to: string;
  onOpen?: () => void;
}

const PRODUCT_IMAGE_FALLBACK = "/product-fallback.svg";

function ProductPicture({
  src,
  alt,
  disabled,
}: {
  src: string;
  alt: string;
  disabled: boolean;
}) {
  const [stage, setStage] = useState<"original" | "fallback" | "hidden">(
    src ? "original" : "fallback",
  );

  if (stage === "hidden") return null;

  return (
    <img
      src={stage === "original" ? src : PRODUCT_IMAGE_FALLBACK}
      alt={alt}
      loading="lazy"
      onError={() => setStage(stage === "original" ? "fallback" : "hidden")}
      className={[
        "product-card-image",
        disabled ? "product-card-image-disabled" : "",
      ].join(" ")}
    />
  );
}

export function ProductCardImage({
  product,
  available,
  isPreventa,
  badge,
  to,
  onOpen,
}: ProductCardImageProps) {
  const badgePresentation = badge
    ? getBadgePresentation(badge)
    : null;

  return (
    <Link
      className="product-card-image-wrap"
      to={to}
      onClick={onOpen}
      aria-label={`Ver detalle de ${product.title}`}
    >
      <ProductPicture
        key={product.img}
        src={product.img}
        alt={product.title}
        disabled={!available && !isPreventa}
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

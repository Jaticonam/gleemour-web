import { useMemo, useState } from "react";
import { ZoomIn } from "lucide-react";

import type { Product } from "@/shared/types/product";
import { getBadgePresentation, sortBadges } from "@/tenant/config/badgeRules";

type ProductGalleryProps = {
  product: Product;
  available: boolean;
  onZoom: (src: string, title: string) => void;
};

function getGalleryImages(product: Product): string[] {
  const images = product.images?.filter(Boolean) ?? [];

  return Array.from(new Set([product.img, ...images].filter(Boolean)));
}

export function ProductGallery({
  product,
  available,
  onZoom,
}: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(product.img);

  const galleryImages = useMemo(() => getGalleryImages(product), [product]);
  const productBadges = product.badges ?? [];

  const safeActiveImage = galleryImages.includes(activeImage)
    ? activeImage
    : galleryImages[0];

  return (
    <div className="product-detail-gallery">
      <div
        className="product-detail-image-wrap"
        onClick={() =>
          onZoom(safeActiveImage, product.title)
        }
      >
        <img
          src={safeActiveImage}
          alt={product.title}
          className={`product-detail-image ${
            !available ? "product-detail-image-disabled" : ""
          }`}
        />

        {productBadges.length > 0 && (
          <div className="product-detail-badges">
            {sortBadges(productBadges)
              .slice(0, 3)
              .map((badge, index) => {
                const presentation = getBadgePresentation(badge);

                return (
                  <span
                    key={`${product.id}-badge-${index}`}
                    className={[
                      "product-detail-badge",
                      presentation.className,
                      presentation.animation,
                    ].join(" ")}
                  >
                    {badge}
                  </span>
                );
              })}
          </div>
        )}

        <div className="product-detail-zoom">
          <ZoomIn className="w-5 h-5" />
        </div>
      </div>

      {galleryImages.length > 1 && (
        <div className="product-gallery-thumbnails" aria-label="Galería de imágenes">
          {galleryImages.map((image, index) => (
            <button
              key={`${product.id}-gallery-${index}`}
              type="button"
              className={[
                "product-gallery-thumbnail",
                image === safeActiveImage ? "product-gallery-thumbnail-active" : "",
              ].join(" ")}
              onClick={() => setActiveImage(image)}
              aria-label={`Ver imagen ${index + 1} de ${product.title}`}
            >
              <img src={image} alt={`${product.title} ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



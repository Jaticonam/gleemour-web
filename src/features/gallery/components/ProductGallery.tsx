import { Maximize2 } from "lucide-react";

import { ProductGalleryModal, useProductGallery } from "@/features/gallery";
import type { Product } from "@/shared/types/product";

import "./ProductGallery.css";

interface ProductGalleryProps {
  product: Product;
  available?: boolean;
}

export function ProductGallery({
  product,
  available = true,
}: ProductGalleryProps) {
  const {
    images,
    activeImage,
    activeIndex,
    zoomImage,
    hasMultipleImages,
    selectImage,
    openZoom,
    closeZoom,
  } = useProductGallery({ product });

  const handleZoom = () => {
    openZoom(activeImage || product.img, product.title);
  };

  return (
    <>
      <div className="product-gallery">
        <div className="product-gallery-main">
          <img
            src={activeImage || product.img}
            alt={product.title}
            className={
              !available
                ? "product-gallery-image product-gallery-image-disabled"
                : "product-gallery-image"
            }
            loading="eager"
          />

          {product.badges?.length ? (
            <div className="product-gallery-badges">
              {product.badges.map((badge) => (
                <span className="product-gallery-badge" key={badge}>
                  {badge}
                </span>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="product-gallery-zoom"
            onClick={handleZoom}
            aria-label="Ampliar imagen"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {hasMultipleImages && (
          <div className="product-gallery-thumbnails">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={
                  index === activeIndex
                    ? "product-gallery-thumbnail product-gallery-thumbnail-active"
                    : "product-gallery-thumbnail"
                }
                onClick={() => selectImage(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img src={image} alt={`${product.title} ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <ProductGalleryModal
        src={zoomImage?.src}
        title={zoomImage?.title}
        onClose={closeZoom}
      />
    </>
  );
}

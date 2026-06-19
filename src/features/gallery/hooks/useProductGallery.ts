import { useMemo, useState } from "react";

import { getProductImages } from "@/features/gallery/utils/gallery.utils";
import type { Product } from "@/shared/types/product";

interface UseProductGalleryOptions {
  product?: Product | null;
}

export function useProductGallery({ product }: UseProductGalleryOptions) {
  const images = useMemo(() => {
    if (!product) return [];
    return getProductImages(product);
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const activeImage = images[activeIndex] ?? images[0] ?? "";

  function selectImage(index: number) {
    if (index < 0 || index >= images.length) return;
    setActiveIndex(index);
  }

  function openZoom(src?: string, title?: string) {
    if (!src) return;

    setZoomImage({
      src,
      title: title || product?.title || "",
    });
  }

  function closeZoom() {
    setZoomImage(null);
  }

  function nextImage() {
    if (images.length <= 1) return;
    setActiveIndex((current) => (current + 1) % images.length);
  }

  function previousImage() {
    if (images.length <= 1) return;

    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1
    );
  }

  return {
    images,
    activeImage,
    activeIndex,
    zoomImage,
    hasMultipleImages: images.length > 1,
    selectImage,
    openZoom,
    closeZoom,
    nextImage,
    previousImage,
  };
}

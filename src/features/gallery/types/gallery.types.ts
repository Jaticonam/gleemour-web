import type { Product } from "@/shared/types/product";

export interface ProductGalleryProps {
  product: Product;
  available: boolean;
  onZoom: (src: string, title: string) => void;
}

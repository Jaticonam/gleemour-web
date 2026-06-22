import type { CartItem, Product } from "@/shared/types/product";

export interface ProductCardBaseProps {
  product: Product;
  cart?: CartItem[];
  onAddToCart: (product: Product) => void;
  onImageClick?: (src: string, title: string) => void;
}

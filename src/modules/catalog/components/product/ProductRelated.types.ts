import type { Product } from "@/shared/types/product";

export interface ProductRelatedProps {
  title: string;
  products: Product[];
  currentCategory: string;
}

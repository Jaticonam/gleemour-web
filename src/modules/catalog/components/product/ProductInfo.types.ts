import type { LucideIcon } from "lucide-react";
import type { Product } from "@/shared/types/product";

export interface ProductInfoProps {
  product: Product;
  categoryName: string;
  descriptionFallback: string;
  stockClass: string;
  StockIcon: LucideIcon;
  stockLabel: string;
  available: boolean;
  viewers: number;
}

import type { KeyboardEvent } from "react";

export interface ProductBuyBoxProps {
  priceLabel: string;
  quantityLabel: string;

  finalPrice: number;
  originalPrice: number;
  hasOffer: boolean;

  qtyInput: string;
  effectiveQty: number;
  total: number;
  isQtyInputValid: boolean;

  available: boolean;

  trustText: string;

  onDecreaseQty: () => void;
  onIncreaseQty: () => void;
  onQtyInputChange: (value: string) => void;
  onQtyInputBlur: () => void;
  onQtyInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;

  onAddToCart: () => void;
  onWhatsApp: () => void;
}

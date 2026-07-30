import { useCallback, useState } from "react";

import { showNotification } from "@/shared/components/feedback/NotificationStack";
import type { Product } from "@/shared/types/product";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

interface UseProductCartOptions {
  product?: Product;
  available: boolean;
  isQtyInputValid: boolean;
  parsedQtyInput: number | null;
  addToCart: (product: Product, qty: number) => void;
}

export function useProductCart({
  product,
  available,
  isQtyInputValid,
  parsedQtyInput,
  addToCart,
}: UseProductCartOptions) {
  const [cartOpen, setCartOpen] = useState(false);

  const handleAddToCart = useCallback(() => {
    if (!product || !available || !isQtyInputValid || parsedQtyInput === null) {
      return;
    }

    addToCart(product, parsedQtyInput);

    showNotification(
      PRODUCT_DETAIL_CONFIG.notifications.addedToCartTitle,
      PRODUCT_DETAIL_CONFIG.notifications.addedToCartDescription,
    );
  }, [
    product,
    available,
    isQtyInputValid,
    parsedQtyInput,
    addToCart,
  ]);

  return {
    cartOpen,
    setCartOpen,
    handleAddToCart,
  };
}

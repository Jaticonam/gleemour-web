import { useCallback, useMemo, useState } from "react";

import type { Product } from "@/shared/types/product";

interface UseProductCartOptions {
  product?: Product;
  available: boolean;
  isQtyInputValid: boolean;
  parsedQtyInput: number | null;
  currentCartQty: number;
  addToCart: (product: Product, qty: number) => void;
  setQty: (qty: number) => void;
  setQtyInput: (qty: string) => void;
}

export function useProductCart({
  product,
  available,
  isQtyInputValid,
  parsedQtyInput,
  currentCartQty,
  addToCart,
  setQty,
  setQtyInput,
}: UseProductCartOptions) {
  const [cartOpen, setCartOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalQty, setModalQty] = useState(0);

  const effectiveCartQty = useMemo(() => {
    return modalQty || currentCartQty;
  }, [modalQty, currentCartQty]);

  const handleAddToCart = useCallback(() => {
    if (!product || !available || !isQtyInputValid || parsedQtyInput === null)
      return;

    const nextQtyInCart = currentCartQty + parsedQtyInput;

    addToCart(product, parsedQtyInput);
    setModalQty(nextQtyInCart);
    setAddModalOpen(true);
  }, [
    product,
    available,
    isQtyInputValid,
    parsedQtyInput,
    currentCartQty,
    addToCart,
  ]);

  const handleAddExtraFromModal = useCallback(
    (extraQty: number) => {
      if (!product || extraQty <= 0) return;

      const nextQty = modalQty + extraQty;

      addToCart(product, extraQty);
      setModalQty(nextQty);
      setQty(nextQty);
      setQtyInput(String(nextQty));
    },
    [product, modalQty, addToCart, setQty, setQtyInput],
  );

  function closeAddModal() {
    setAddModalOpen(false);
  }

  function openCartFromModal() {
    setAddModalOpen(false);
    setCartOpen(true);
  }

  function resetProductCartState() {
    setModalQty(0);
    setAddModalOpen(false);
  }

  return {
    cartOpen,
    setCartOpen,
    addModalOpen,
    modalQty,
    effectiveCartQty,
    handleAddToCart,
    handleAddExtraFromModal,
    closeAddModal,
    openCartFromModal,
    resetProductCartState,
  };
}

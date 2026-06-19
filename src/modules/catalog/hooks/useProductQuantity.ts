import { useCallback, useState } from "react";

export function useProductQuantity(initialQty = 1) {
  const [qty, setQty] = useState(initialQty);
  const [qtyInput, setQtyInput] = useState(String(initialQty));

  const parsedQtyInput =
    qtyInput.trim() !== "" && /^\d+$/.test(qtyInput)
      ? parseInt(qtyInput, 10)
      : null;

  const isQtyInputValid = parsedQtyInput !== null && parsedQtyInput >= 1;
  const effectiveQty = isQtyInputValid ? parsedQtyInput : qty;

  const updateQty = useCallback((newQty: number) => {
    const safeQty = Math.max(1, Math.floor(newQty));
    setQty(safeQty);
    setQtyInput(String(safeQty));
  }, []);

  const resetQty = useCallback(() => {
    setQty(initialQty);
    setQtyInput(String(initialQty));
  }, [initialQty]);

  const handleQtyInputChange = useCallback((value: string) => {
    if (value === "") {
      setQtyInput("");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setQtyInput(value);

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1) setQty(parsed);
  }, []);

  const handleQtyInputBlur = useCallback(() => {
    const parsed = parseInt(qtyInput, 10);

    if (isNaN(parsed) || parsed < 1) {
      updateQty(1);
      return;
    }

    updateQty(parsed);
  }, [qtyInput, updateQty]);

  const handleQtyInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") event.currentTarget.blur();

      if (event.key === "ArrowUp") {
        event.preventDefault();
        updateQty(effectiveQty + 1);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        updateQty(Math.max(1, effectiveQty - 1));
      }
    },
    [effectiveQty, updateQty]
  );

  return {
    qty,
    qtyInput,
    parsedQtyInput,
    isQtyInputValid,
    effectiveQty,
    setQty,
    updateQty,
    resetQty,
    handleQtyInputChange,
    handleQtyInputBlur,
    handleQtyInputKeyDown,
  };
}



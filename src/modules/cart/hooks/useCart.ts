import { useState, useEffect, useCallback } from "react";
import { CartItem, Product } from "@/shared/types/product";
import { getEffectivePrice } from "@/domain/product/pricing";

const CART_KEY = "jung_cart";

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === CART_KEY) {
        try {
          setCart(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {
          setCart([]);
        }
      }
    };

    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const addToCart = useCallback((product: Product, qty: number = 1) => {
    const safeQty = Math.max(1, Math.floor(qty));

    setCart((prev) => {
      const existing = prev.find((x) => x.id === product.id);

      if (existing) {
        return prev.map((x) =>
          x.id === product.id
            ? { ...x, qty: x.qty + safeQty }
            : x
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: safeQty,
          note: "",
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const changeQty = useCallback((id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((x) => {
          if (x.id !== id) return x;

          const newQty = x.qty + delta;
          if (newQty <= 0) return null;

          return { ...x, qty: newQty };
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const setExactQty = useCallback((id: string, qty: number | null) => {
    setCart((prev) => {
      return prev
        .map((x) => {
          if (x.id !== id) return x;
          if (qty === null) return x;

          const safeQty = Math.floor(qty);
          if (safeQty <= 0) return null;

          return { ...x, qty: safeQty };
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const setItemNote = useCallback((id: string, note: string) => {
    setCart((prev) =>
      prev.map((x) =>
        x.id === id
          ? { ...x, note: note ?? "" }
          : x
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  const totalPrice = cart.reduce(
    (acc, item) => acc + getEffectivePrice(item) * item.qty,
    0
  );

  const totalOriginal = cart.reduce(
    (acc, item) => acc + item.price_1 * item.qty,
    0
  );

  const savings = Math.max(0, totalOriginal - totalPrice);

  return {
    cart,
    addToCart,
    removeFromCart,
    changeQty,
    setExactQty,
    setItemNote,
    clearCart,
    totalItems,
    totalPrice,
    savings,
  };
}




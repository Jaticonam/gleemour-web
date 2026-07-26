import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  CartItem,
  Product,
} from "@/shared/types/product";

import { getEffectivePrice } from "@/domain/product/pricing";

const CART_KEY = "gleemour_cart_v1";
const LEGACY_CART_KEY = "jung_cart";

function parseStoredCart(rawValue: string | null): CartItem[] | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(rawValue);

    return Array.isArray(parsed)
      ? (parsed as CartItem[])
      : null;
  } catch {
    return null;
  }
}

function loadCart(): CartItem[] {
  const currentCart = parseStoredCart(
    localStorage.getItem(CART_KEY)
  );

  if (currentCart !== null) {
    return currentCart;
  }

  const legacyCart = parseStoredCart(
    localStorage.getItem(LEGACY_CART_KEY)
  );

  if (legacyCart !== null) {
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(legacyCart)
      );

      localStorage.removeItem(LEGACY_CART_KEY);
    } catch {
      return legacyCart;
    }

    return legacyCart;
  }

  return [];
}

function saveCart(cart: CartItem[]): void {
  try {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cart)
    );
  } catch {
    return;
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>(
    () => loadCart()
  );

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      const isCartStorageEvent =
        event.key === CART_KEY ||
        event.key === LEGACY_CART_KEY;

      if (!isCartStorageEvent) {
        return;
      }

      setCart(loadCart());
    };

    window.addEventListener(
      "storage",
      handler
    );

    return () => {
      window.removeEventListener(
        "storage",
        handler
      );
    };
  }, []);

  const addToCart = useCallback(
    (
      product: Product,
      qty: number = 1
    ) => {
      const safeQty = Math.max(
        1,
        Math.floor(qty)
      );

      setCart((previousCart) => {
        const existingItem =
          previousCart.find(
            (item) => item.id === product.id
          );

        if (existingItem) {
          return previousCart.map((item) =>
            item.id === product.id
              ? {
                  ...item,
                  qty: item.qty + safeQty,
                }
              : item
          );
        }

        return [
          ...previousCart,
          {
            ...product,
            qty: safeQty,
            note: "",
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback(
    (id: string) => {
      setCart((previousCart) =>
        previousCart.filter(
          (item) => item.id !== id
        )
      );
    },
    []
  );

  const changeQty = useCallback(
    (
      id: string,
      delta: number
    ) => {
      setCart((previousCart) =>
        previousCart
          .map((item) => {
            if (item.id !== id) {
              return item;
            }

            const newQty =
              item.qty + delta;

            if (newQty <= 0) {
              return null;
            }

            return {
              ...item,
              qty: newQty,
            };
          })
          .filter(
            (item): item is CartItem =>
              item !== null
          )
      );
    },
    []
  );

  const setExactQty = useCallback(
    (
      id: string,
      qty: number | null
    ) => {
      setCart((previousCart) =>
        previousCart
          .map((item) => {
            if (
              item.id !== id ||
              qty === null
            ) {
              return item;
            }

            const safeQty =
              Math.floor(qty);

            if (safeQty <= 0) {
              return null;
            }

            return {
              ...item,
              qty: safeQty,
            };
          })
          .filter(
            (item): item is CartItem =>
              item !== null
          )
      );
    },
    []
  );

  const setItemNote = useCallback(
    (
      id: string,
      note: string
    ) => {
      setCart((previousCart) =>
        previousCart.map((item) =>
          item.id === id
            ? {
                ...item,
                note: note ?? "",
              }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = cart.reduce(
    (total, item) =>
      total + item.qty,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      getEffectivePrice(item) *
        item.qty,
    0
  );

  const totalOriginal = cart.reduce(
    (total, item) =>
      total +
      item.price *
        item.qty,
    0
  );

  const savings = Math.max(
    0,
    totalOriginal - totalPrice
  );

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

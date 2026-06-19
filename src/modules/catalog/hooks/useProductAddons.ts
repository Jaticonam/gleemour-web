import { useMemo, useState } from "react";

import type {
  ProductAddon,
  SelectedProductAddon,
} from "@/modules/catalog/components/product/ProductAddons/ProductAddons.types";

export function useProductAddons(addons: ProductAddon[] = []) {
  const [selectedAddons, setSelectedAddons] = useState<SelectedProductAddon[]>(
    []
  );

  function toggleAddon(addon: ProductAddon) {
    setSelectedAddons((current) => {
      const exists = current.some((item) => item.id === addon.id);

      if (exists) {
        return current.filter((item) => item.id !== addon.id);
      }

      return [
        ...current,
        {
          ...addon,
          qty: 1,
        },
      ];
    });
  }

  function clearAddons() {
    setSelectedAddons([]);
  }

  const addonsTotal = useMemo(() => {
    return selectedAddons.reduce(
      (total, addon) => total + addon.price * addon.qty,
      0
    );
  }, [selectedAddons]);

  return {
    addons,
    selectedAddons,
    addonsTotal,
    toggleAddon,
    clearAddons,
  };
}

import { useMemo } from "react";

import type { MusicTrack } from "@/domain/music";
import type { SelectedProductAddon } from "@/modules/catalog/components/product/ProductAddons/ProductAddons.types";
import type { ProductConfiguration } from "@/modules/catalog/types/ProductConfiguration.types";

interface UseProductConfigurationOptions {
  unitPrice: number;
  quantity: number;
  selectedAddons: SelectedProductAddon[];
  addonsTotal: number;
  tracks: MusicTrack[];
  selectedMusicId: string;
  dedication: string;
}

export function useProductConfiguration({
  unitPrice,
  quantity,
  selectedAddons,
  addonsTotal,
  tracks,
  selectedMusicId,
  dedication,
}: UseProductConfigurationOptions): ProductConfiguration {
  return useMemo(() => {
    const safeUnitPrice =
      Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : 0;

    const safeQuantity = Math.max(1, Math.floor(quantity));

    const safeAddonsTotal =
      Number.isFinite(addonsTotal) && addonsTotal > 0
        ? addonsTotal
        : 0;

    const selectedMusic =
      tracks.find((track) => track.id === selectedMusicId) ?? null;

    const productSubtotal = safeUnitPrice * safeQuantity;
    const configuredTotal = productSubtotal + safeAddonsTotal;

    return {
      quantity: safeQuantity,
      selectedAddons,
      selectedMusic,
      dedication,
      productSubtotal,
      addonsTotal: safeAddonsTotal,
      configuredTotal,
    };
  }, [
    addonsTotal,
    dedication,
    quantity,
    selectedAddons,
    selectedMusicId,
    tracks,
    unitPrice,
  ]);
}
import type { MusicTrack } from "@/domain/music";
import type { SelectedProductAddon } from "@/modules/catalog/components/product/ProductAddons/ProductAddons.types";

export interface ProductConfiguration {
  quantity: number;
  selectedAddons: SelectedProductAddon[];
  selectedMusic: MusicTrack | null;
  dedication: string;
  productSubtotal: number;
  addonsTotal: number;
  configuredTotal: number;
}
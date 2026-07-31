import type { Addon } from "@/shared/types/product";

export type ProductAddon = Addon;

export interface SelectedProductAddon extends Addon {
  qty: number;
}

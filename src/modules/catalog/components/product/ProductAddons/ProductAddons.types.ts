export interface ProductAddon {
  id: string;
  title: string;
  description?: string;
  price: number;
  emoji?: string;
}

export interface SelectedProductAddon extends ProductAddon {
  qty: number;
}

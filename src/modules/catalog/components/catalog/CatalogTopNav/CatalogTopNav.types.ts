export interface CatalogNavItem {
  id: string;
  name: string;
  icon?: string;
}

export interface CatalogTopNavProps {
  topItems: CatalogNavItem[];
  bottomItems: CatalogNavItem[];

  activeTop?: string;
  activeBottom?: string;

  topCounts?: Record<string, number>;
  bottomCounts?: Record<string, number>;

  onTopSelect?: (id: string) => void;
  onBottomSelect?: (id: string) => void;
}

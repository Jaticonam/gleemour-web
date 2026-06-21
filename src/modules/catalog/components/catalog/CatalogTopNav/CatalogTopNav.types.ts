export interface CatalogNavItem {
  id: string;
  name: string;
  icon?: string;
  colorClass?: string;
}

export interface CatalogTopNavProps {
  campaignItems: CatalogNavItem[];
  categoryItems: CatalogNavItem[];

  activeCampaign?: string;
  activeCategory?: string;

  campaignCounts?: Record<string, number>;
  categoryCounts?: Record<string, number>;

  onCampaignSelect?: (id: string) => void;
  onCategorySelect?: (id: string) => void;

  searchSlot?: React.ReactNode;
  logoSlot?: React.ReactNode;
}

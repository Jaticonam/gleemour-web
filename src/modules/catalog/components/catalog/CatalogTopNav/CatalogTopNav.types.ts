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
  activeDiscover?: DiscoverKey | "";
  discoverItems?: ReadonlyArray<{ id: DiscoverKey; name: string }>;

  campaignCounts?: Record<string, number>;
  categoryCounts?: Record<string, number>;

  onCampaignSelect?: (id: string) => void;
  onCategorySelect?: (id: string) => void;
  onDiscoverSelect?: (id: DiscoverKey | "") => void;

  searchSlot?: React.ReactNode;
  logoSlot?: React.ReactNode;
  helpSlot?: React.ReactNode;
}
import type { DiscoverKey } from "@/modules/catalog/pages/CatalogFilters";

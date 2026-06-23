import type { Campaign } from "@/shared/types/product";

type CsvRow = Record<string, string>;

function parseBoolean(value: string) {
  return ["true", "1", "si", "sí", "yes", "y"].includes(
    value.trim().toLowerCase(),
  );
}

export function normalizeCampaign(row: CsvRow): Campaign {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    colorClass: row.colorclass,
    status: row.status,
    startDate: row.startdate,
    endDate: row.enddate,
    priority: Number(row.priority || 0),
    showInCatalog: parseBoolean(row.showincatalog),
  };
}

export function isCampaignActive(campaign: Campaign) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = campaign.startDate ? new Date(campaign.startDate) : null;
  const end = campaign.endDate ? new Date(campaign.endDate) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  if (start && today < start) return false;
  if (end && today > end) return false;

  return (
    campaign.status.trim().toLowerCase() === "activo" &&
    campaign.showInCatalog
  );
}

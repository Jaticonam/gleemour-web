import type { Campaign } from "@/shared/types/product";

type CsvRow = Record<string, string>;

function parseBoolean(value: string) {
  return ["true", "1", "si", "sí", "yes", "y"].includes(
    value.trim().toLowerCase(),
  );
}

function parseSheetDate(value: string) {
  const clean = value.trim();

  if (!clean) return null;

  const humanDate = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);

  if (humanDate) {
    const [, day, month, year] = humanDate;
    const date = new Date(Number(year), Number(month) - 1, Number(day));

    return Number.isNaN(date.getTime()) ? null : date;
  }

  const isoDate = new Date(clean);

  return Number.isNaN(isoDate.getTime()) ? null : isoDate;
}

export function getCampaignComputedStatus(
  campaign: Pick<Campaign, "startDate" | "endDate" | "showInCatalog">,
): Campaign["computedStatus"] {
  if (!campaign.showInCatalog) return "oculta";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = parseSheetDate(campaign.startDate);
  const end = parseSheetDate(campaign.endDate);

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);

  if (start && today < start) return "programada";
  if (end && today > end) return "finalizada";

  return "activa";
}

export function normalizeCampaign(row: CsvRow): Campaign {
  const campaign: Campaign = {
    id: row.id,
    name: row.name,
    icon: row.icon,
    colorClass: row.colorclass,
    startDate: row.startdate,
    endDate: row.enddate,
    priority: Number(row.priority || 0),
    showInCatalog: parseBoolean(row.showincatalog),
  };

  return {
    ...campaign,
    computedStatus: getCampaignComputedStatus(campaign),
  };
}

export function isCampaignActive(campaign: Campaign) {
  return campaign.computedStatus === "activa";
}

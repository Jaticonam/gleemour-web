import type { Campaign } from "@/shared/types/product";
import { getCampaignColorClass } from "./campaignColors";

type CsvRow = Record<string, string>;

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

function normalizePublicationStatus(value: string) {
  const status = value.trim().toLowerCase();

  const map: Record<string, Campaign["computedStatus"]> = {
    publicado: "activa",
    publicada: "activa",
    publicadas: "activa",
    active: "activa",
    published: "activa",

    oculto: "oculta",
    oculta: "oculta",
    hidden: "oculta",

    borrador: "borrador",
    draft: "borrador",
  };

  return map[status] ?? "borrador";
}

export function getCampaignComputedStatus(
  campaign: Pick<Campaign, "startDate" | "endDate" | "publicationStatus">,
): Campaign["computedStatus"] {
  const publicationStatus = normalizePublicationStatus(
    campaign.publicationStatus,
  );

  if (publicationStatus === "oculta") return "oculta";
  if (publicationStatus === "borrador") return "borrador";

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
    colorClass: getCampaignColorClass(row.color),
    startDate: row.startdate,
    endDate: row.enddate,
    priority: Number(row.priority || 0),
    publicationStatus: row.publicationstatus,
  };

  return {
    ...campaign,
    computedStatus: getCampaignComputedStatus(campaign),
  };
}

export function isCampaignActive(campaign: Campaign) {
  return campaign.computedStatus === "activa";
}

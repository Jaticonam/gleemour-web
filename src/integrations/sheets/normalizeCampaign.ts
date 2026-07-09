import type { Campaign } from "@/shared/types/product";
import { getCampaignColorClass } from "./campaignColors";

type CsvRow = Record<string, string>;

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function slugify(value: unknown): string {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseNumber(value: unknown): number {
  const cleaned = cleanText(value).replace(/\s/g, "").replace(",", ".");
  const num = Number(cleaned);

  return Number.isFinite(num) ? num : 0;
}

function parseSheetDate(value: string) {
  const clean = cleanText(value);

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
  const status = slugify(value);

  const map: Record<string, Campaign["computedStatus"]> = {
    publicado: "activa",
    publicada: "activa",
    publicadas: "activa",
    active: "activa",
    activa: "activa",
    activo: "activa",
    published: "activa",
    visible: "activa",

    oculto: "oculta",
    oculta: "oculta",
    ocultar: "oculta",
    hidden: "oculta",
    inactivo: "oculta",
    inactiva: "oculta",

    borrador: "borrador",
    draft: "borrador",
    pendiente: "borrador",
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
  const name = cleanText(row.name);
  const id = slugify(row.id || name);

  const campaignBase: Campaign = {
    id,
    name,
    icon: cleanText(row.icon),
    colorClass: getCampaignColorClass(row.color),
    startDate: cleanText(row.startdate),
    endDate: cleanText(row.enddate),
    priority: parseNumber(row.priority),
    publicationStatus: cleanText(row.publicationstatus),
    showInCatalog: false,
  };

  const computedStatus = getCampaignComputedStatus(campaignBase);

  return {
    ...campaignBase,
    computedStatus,
    showInCatalog: computedStatus === "activa",
  };
}

export function isCampaignActive(campaign: Campaign) {
  return campaign.computedStatus === "activa";
}
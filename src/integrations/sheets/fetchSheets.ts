import type { Addon, Campaign, Product } from "@/shared/types/product";
import { SHEETS_CONFIG, type SheetSource } from "./sheetsConfig";
import { normalizeAddon, normalizeProduct } from "./normalizeProduct";
import { normalizeCampaign, isCampaignActive } from "./normalizeCampaign";
import { validateProducts } from "./validateProducts";

type CsvRow = Record<string, string>;

const PRODUCT_REQUIRED_HEADERS = [
  "id",
  "title",
  "description",
  "category",
  "price",
  "offer_price",
  "addons",
  "stock",
  "img",
  "status",
  "badge",
  "attributes",
  "priority",
  "occasion",
  "message",
  "highlight",
  "campaigns",
  "updated_at",
] as const;

const ADDON_REQUIRED_HEADERS = [
  "id",
  "title",
  "price",
  "img",
  "category",
  "status",
  "priority",
] as const;

const CAMPAIGN_REQUIRED_HEADERS = [
  "id",
  "name",
  "icon",
  "color",
  "startdate",
  "enddate",
  "priority",
  "publicationstatus",
] as const;

const PUBLIC_PRODUCT_STATUSES = ["Publicado", "Preventa"] as const;
const PUBLIC_ADDON_STATUSES = ["Publicado"] as const;

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseCSVLine(lines[0]).map((header) =>
    header.trim().toLowerCase(),
  );

  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = (values[index] ?? "").trim();
    });

    return row;
  });

  return { headers, rows };
}

function getMeaningfulRows(rows: CsvRow[]) {
  return rows.filter((row) =>
    Object.values(row).some((value) => value.trim() !== ""),
  );
}
function validateHeaders(
  headers: string[],
  requiredHeaders: readonly string[],
  sourceName: string,
  source: SheetSource,
) {
  const missing = requiredHeaders.filter(
    (required) => !headers.includes(required.toLowerCase()),
  );

  if (missing.length > 0) {
    throw new Error(
      `La hoja "${sourceName}" docId="${source.docId}" gid="${source.gid}" no cumple el schema. Faltan columnas: ${missing.join(
        ", ",
      )}`,
    );
  }
}

function getRequiredHeaders(sourceName: keyof typeof SHEETS_CONFIG) {
  if (sourceName === "products") return PRODUCT_REQUIRED_HEADERS;
  if (sourceName === "addons") return ADDON_REQUIRED_HEADERS;
  if (sourceName === "campaigns") return CAMPAIGN_REQUIRED_HEADERS;

  return [];
}

async function loadSheetRows(
  sourceName: keyof typeof SHEETS_CONFIG,
): Promise<CsvRow[]> {
  const source = SHEETS_CONFIG[sourceName];

  const url = `https://docs.google.com/spreadsheets/d/${source.docId}/export?format=csv&gid=${source.gid}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Error cargando hoja "${sourceName}" docId="${source.docId}" gid="${source.gid}": HTTP ${response.status}`,
    );
  }

  const csvText = await response.text();
  const { headers, rows } = parseCSV(csvText);

  validateHeaders(headers, getRequiredHeaders(sourceName), sourceName, source);

  return getMeaningfulRows(rows);
}

export async function loadAllProducts(): Promise<Product[]> {
  const rows = await loadSheetRows("products");

  const normalized = rows
    .map(normalizeProduct)
    .filter((product) =>
      PUBLIC_PRODUCT_STATUSES.includes(
        product.status.trim() as (typeof PUBLIC_PRODUCT_STATUSES)[number],
      ),
    );

  return validateProducts(normalized).sort((a, b) => b.priority - a.priority);
}

export async function loadAllAddons(): Promise<Addon[]> {
  const rows = await loadSheetRows("addons");

  return rows
    .map(normalizeAddon)
    .filter((addon) =>
      PUBLIC_ADDON_STATUSES.includes(
        addon.status.trim() as (typeof PUBLIC_ADDON_STATUSES)[number],
      ),
    )
    .sort((a, b) => b.priority - a.priority);
}

export async function loadAllCampaigns(): Promise<Campaign[]> {
  const rows = await loadSheetRows("campaigns");

  return rows
    .map(normalizeCampaign)
    .filter(isCampaignActive)
    .sort((a, b) => b.priority - a.priority);
}

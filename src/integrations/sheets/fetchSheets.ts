import type { MusicTrack } from "@/domain/music";
import type {
  Addon,
  Campaign,
  CatalogSubcategory,
  Product,
} from "@/shared/types/product";
import { SHEETS_CONFIG, type SheetSource } from "./sheetsConfig";
import { normalizeAddon, normalizeProduct } from "./normalizeProduct";
import { normalizeCampaign } from "./normalizeCampaign";
import { normalizeMusicTrack } from "./normalizeMusicTrack";
import { normalizeSubcategory } from "./normalizeSubcategory";
import { validateProducts } from "./validateProducts";
import { validateSubcategories } from "./validateSubcategories";
import { isVisibleProductStatus } from "@/tenant/config/product/statuses";

type CsvRow = Record<string, string>;

/**
 * Columnas mínimas para que el catálogo pueda vender.
 * Si falta una de estas, sí hay problema estructural real.
 */
const PRODUCT_REQUIRED_HEADERS = ["id", "title", "price", "status"] as const;

/**
 * Columnas útiles para buena experiencia, pero no deben tumbar la tienda.
 */
const PRODUCT_RECOMMENDED_HEADERS = [
  "description",
  "category",
  "categories",
  "subcategory",
  "offer_price",
  "addons",
  "stock",
  "img",
  "images",
  "badge",
  "badges",
  "priority",
  "campaigns",
  "updated_at",
] as const;

/**
 * Columnas premium/emocionales.
 * Perfectas para Product Detail Premium, pero jamás deben romper ventas.
 */
const PRODUCT_PREMIUM_HEADERS = [
  "attributes",
  "occasion",
  "message",
  "highlight",
] as const;

const SUBCATEGORY_REQUIRED_HEADERS = [
  "subcategory_id",
  "category_id",
  "subcategory",
  "status",
] as const;

const SUBCATEGORY_RECOMMENDED_HEADERS = [
  "icon",
  "description",
  "priority",
] as const;

const ADDON_REQUIRED_HEADERS = ["id", "title", "price", "status"] as const;

const ADDON_RECOMMENDED_HEADERS = ["img", "category", "priority"] as const;

const MUSIC_LIBRARY_REQUIRED_HEADERS = [
  "id",
  "title",
  "description",
  "music_type",
  "moodmusical",
  "platform",
  "priority",
  "status",
  "url",
] as const;

const CAMPAIGN_REQUIRED_HEADERS = ["id", "name"] as const;

const CAMPAIGN_RECOMMENDED_HEADERS = [
  "icon",
  "color",
  "startdate",
  "enddate",
  "priority",
  "publicationstatus",
] as const;

const PUBLIC_ADDON_STATUSES = ["Publicado"] as const;
const PUBLIC_MUSIC_STATUSES = ["Publicado"] as const;

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

function getMissingHeaders(
  headers: string[],
  expectedHeaders: readonly string[],
): string[] {
  const normalizedHeaders = new Set(
    headers.map((header) => header.toLowerCase()),
  );

  return expectedHeaders.filter(
    (expected) => !normalizedHeaders.has(expected.toLowerCase()),
  );
}

function throwMissingRequiredHeaders(
  headers: string[],
  requiredHeaders: readonly string[],
  sourceName: string,
  source: SheetSource,
) {
  const missing = getMissingHeaders(headers, requiredHeaders);

  if (missing.length > 0) {
    throw new Error(
      `La hoja "${sourceName}" docId="${source.docId}" gid="${source.gid}" no cumple el schema mínimo de venta. Faltan columnas críticas: ${missing.join(
        ", ",
      )}`,
    );
  }
}

function warnMissingOptionalHeaders(
  headers: string[],
  optionalHeaders: readonly string[],
  sourceName: string,
  label: "recomendadas" | "premium",
) {
  const missing = getMissingHeaders(headers, optionalHeaders);

  if (missing.length === 0) return;

  // Las columnas premium no deben ensuciar consola ni asustar.
  // Son mejora comercial, no condición de venta.
  if (label === "premium") {
    if (import.meta.env.DEV) {
      console.info(
        `La hoja "${sourceName}" no tiene columnas premium. Se usarán fallbacks:`,
        missing,
      );
    }

    return;
  }

  // Las recomendadas sí merecen aviso en desarrollo,
  // pero no deberían verse como error fatal.
  if (import.meta.env.DEV) {
    console.info(
      `La hoja "${sourceName}" no tiene columnas ${label}. Se usarán fallbacks:`,
      missing,
    );
  }
}

function validateSheetHeaders(
  headers: string[],
  sourceName: keyof typeof SHEETS_CONFIG,
  source: SheetSource,
) {
  if (sourceName === "products") {
    throwMissingRequiredHeaders(
      headers,
      PRODUCT_REQUIRED_HEADERS,
      sourceName,
      source,
    );

    warnMissingOptionalHeaders(
      headers,
      PRODUCT_RECOMMENDED_HEADERS,
      sourceName,
      "recomendadas",
    );

    warnMissingOptionalHeaders(
      headers,
      PRODUCT_PREMIUM_HEADERS,
      sourceName,
      "premium",
    );

    return;
  }

  if (sourceName === "subcategories") {
    throwMissingRequiredHeaders(
      headers,
      SUBCATEGORY_REQUIRED_HEADERS,
      sourceName,
      source,
    );

    warnMissingOptionalHeaders(
      headers,
      SUBCATEGORY_RECOMMENDED_HEADERS,
      sourceName,
      "recomendadas",
    );

    return;
  }

  if (sourceName === "addons") {
    throwMissingRequiredHeaders(
      headers,
      ADDON_REQUIRED_HEADERS,
      sourceName,
      source,
    );

    warnMissingOptionalHeaders(
      headers,
      ADDON_RECOMMENDED_HEADERS,
      sourceName,
      "recomendadas",
    );

    return;
  }

  if (sourceName === "musicLibrary") {
    throwMissingRequiredHeaders(
      headers,
      MUSIC_LIBRARY_REQUIRED_HEADERS,
      sourceName,
      source,
    );

    return;
  }

  if (sourceName === "campaigns") {
    throwMissingRequiredHeaders(
      headers,
      CAMPAIGN_REQUIRED_HEADERS,
      sourceName,
      source,
    );

    warnMissingOptionalHeaders(
      headers,
      CAMPAIGN_RECOMMENDED_HEADERS,
      sourceName,
      "recomendadas",
    );
  }
}

async function loadSheetRows(
  sourceName: keyof typeof SHEETS_CONFIG,
): Promise<CsvRow[]> {
  const source = SHEETS_CONFIG[sourceName];

  const cacheBust = `&t=${Date.now()}`;

  const url = `https://docs.google.com/spreadsheets/d/${source.docId}/export?format=csv&gid=${source.gid}${cacheBust}`;

  const response = await fetch(url, {
    cache: "no-store",
  });


  if (!response.ok) {
    throw new Error(
      `Error cargando hoja "${sourceName}" docId="${source.docId}" gid="${source.gid}": HTTP ${response.status}`,
    );
  }

  const csvText = await response.text();
  const { headers, rows } = parseCSV(csvText);

  validateSheetHeaders(headers, sourceName, source);

  return getMeaningfulRows(rows);
}

export async function loadAllProducts(): Promise<Product[]> {
  const rows = await loadSheetRows("products");

  const normalized = rows.map(normalizeProduct);

  return validateProducts(normalized)
    .filter((product) => isVisibleProductStatus(product.status.trim()))
    .sort((a, b) => b.priority - a.priority);
}

export async function loadAllSubcategories(): Promise<
  CatalogSubcategory[]
> {
  const rows = await loadSheetRows("subcategories");

  return validateSubcategories(rows.map(normalizeSubcategory));
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

export async function loadMusicLibrary(): Promise<MusicTrack[]> {
  const rows = await loadSheetRows("musicLibrary");

  return rows
    .map(normalizeMusicTrack)
    .filter((track) =>
      PUBLIC_MUSIC_STATUSES.includes(
        track.status.trim() as (typeof PUBLIC_MUSIC_STATUSES)[number],
      ),
    )
    .sort((a, b) => b.priority - a.priority);
}

export async function loadAllCampaigns(): Promise<Campaign[]> {
  const rows = await loadSheetRows("campaigns");

  const normalized = rows.map(normalizeCampaign);

  console.table(
    rows.map((row, index) => ({
      index,
      id: row.id,
      name: row.name,
      rawColor: row.color,
      publicationStatus: row.publicationstatus,
      normalizedColorClass: normalized[index]?.colorClass,
    })),
  );

  return normalized.sort((a, b) => b.priority - a.priority);
}

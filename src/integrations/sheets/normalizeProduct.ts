import type { Addon, Product } from "@/shared/types/product";
import { getCategoryIdFromSheetLabel } from "@/tenant/config/categories";

type CsvRow = Record<string, string>;

export type SheetProduct = Product;
export type SheetAddon = Addon;

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function slugify(value: unknown): string {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

function parseNumber(value: unknown): number | null {
  const cleaned = cleanText(value).replace(/\s/g, "").replace(",", ".");

  if (!cleaned) return null;

  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseRequiredNumber(value: unknown): number {
  return parseNumber(value) ?? 0;
}

function parsePipeList(value: unknown): string[] {
  return cleanText(value)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCategories(value: unknown): string[] {
  return parsePipeList(value).map(getCategoryIdFromSheetLabel).filter(Boolean);
}

function parseBadges(value: unknown): string[] {
  return parsePipeList(value);
}

function normalizeAttribute(value: unknown): string {
  const slug = slugify(value);

  const map: Record<string, string> = {
    natural: "natural",
    naturales: "natural",

    artificial: "artificial",
    artificiales: "artificial",

    corporativo: "corporate",
    corporativos: "corporate",
    corporate: "corporate",

    premium: "premium",
    vip: "premium",

    express: "express",
    rapido: "express",
    rapida: "express",
    "entrega-rapida": "express",
  };

  return map[slug] ?? slug;
}

function parseAttributes(value: unknown): string[] {
  return Array.from(
    new Set(parsePipeList(value).map(normalizeAttribute).filter(Boolean)),
  );
}

function parseAddons(value: unknown): string[] {
  return parsePipeList(value).map(slugify).filter(Boolean);
}

export function normalizeProduct(row: CsvRow): SheetProduct {
  const primaryCategory = getCategoryIdFromSheetLabel(row.category);
  const extraCategories = parseCategories(row.categories);

  const categories = Array.from(
    new Set([primaryCategory, ...extraCategories].filter(Boolean)),
  );

  return {
    id: cleanText(row.id),
    title: cleanText(row.title),
    description: cleanText(row.description),

    category: primaryCategory,
    categories,

    price: parseRequiredNumber(row.price),
    offer_price: parseNumber(row.offer_price),

    addons: parseAddons(row.addons),
    attributes: parseAttributes(row.attributes),

    stock: parseNumber(row.stock),
    img: cleanText(row.img),
    images: parsePipeList(row.images),

    status: cleanText(row.status),
    badges: parseBadges(row.badge),
    priority: parseRequiredNumber(row.priority),

    occasion: cleanText(row.occasion),
    message: cleanText(row.message),
    highlight: cleanText(row.highlight),
    updated_at: cleanText(row.updated_at),
  };
}

export function normalizeAddon(row: CsvRow): SheetAddon {
  return {
    id: cleanText(row.id),
    title: cleanText(row.title),
    price: parseRequiredNumber(row.price),
    img: cleanText(row.img),
    category: slugify(row.category),
    status: cleanText(row.status),
    priority: parseRequiredNumber(row.priority),
  };
}

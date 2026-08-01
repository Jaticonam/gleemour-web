import type { CatalogSubcategory } from "@/shared/types/product";

type CsvRow = Record<string, string>;

function cleanText(value: unknown): string {
  return String(value ?? "").trim();
}

function parsePriority(value: unknown): number {
  const cleaned = cleanText(value).replace(/\s/g, "").replace(",", ".");

  if (!cleaned) return 0;

  const priority = Number(cleaned);
  return Number.isFinite(priority) ? priority : 0;
}

function normalizeStatus(value: unknown): string {
  const raw = cleanText(value);
  const normalized = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const statusMap: Record<string, string> = {
    publicado: "Publicado",
    publicada: "Publicado",
    activo: "Publicado",
    activa: "Publicado",
    visible: "Publicado",
    borrador: "Borrador",
    pendiente: "Borrador",
    oculto: "Oculto",
    oculta: "Oculto",
    inactivo: "Oculto",
    inactiva: "Oculto",
  };

  return statusMap[normalized] ?? raw;
}

export function normalizeSubcategory(
  row: CsvRow,
): CatalogSubcategory {
  return {
    id: cleanText(row.subcategory_id),
    categoryId: cleanText(row.category_id).toLowerCase(),
    name: cleanText(row.subcategory),
    icon: cleanText(row.icon) || "✨",
    description: cleanText(row.description),
    priority: parsePriority(row.priority),
    status: normalizeStatus(row.status),
  };
}
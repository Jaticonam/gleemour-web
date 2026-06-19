import { Category } from "@/shared/types/product";

/**
 * Categorías oficiales del catálogo.
 *
 * id:
 * - Identificador técnico interno.
 * - Se usa para rutas, filtros y lógica.
 *
 * sheetLabel:
 * - Texto humano permitido en Google Sheets.
 * - Facilita operación comercial sin usar slugs técnicos.
 */
export interface CatalogCategory extends Category {
  sheetLabel: string;
}

export const CATEGORIES: CatalogCategory[] = [
  {
    id: "todas",
    name: "Todos",
    sheetLabel: "Todos",
    icon: "✨",
    description: "Explora cada emoción especial.",
  },
  {
    id: "para-enamorar",
    name: "Para enamorar",
    sheetLabel: "Para enamorar",
    icon: "💘",
    description: "Conquista corazones con detalles únicos.",
  },
  {
    id: "momentos-especiales",
    name: "Momentos especiales",
    sheetLabel: "Momentos especiales",
    icon: "✨",
    description: "Fechas llenas de emoción inolvidable.",
  },
  {
    id: "para-sorprender",
    name: "Para sorprender",
    sheetLabel: "Para sorprender",
    icon: "🎁",
    description: "Sorprende con gestos inolvidables siempre.",
  },
  {
    id: "para-celebrar",
    name: "Para celebrar",
    sheetLabel: "Para celebrar",
    icon: "🎉",
    description: "Celebra momentos felices con estilo.",
  },
  {
    id: "para-agradecer",
    name: "Para agradecer",
    sheetLabel: "Para agradecer",
    icon: "💌",
    description: "Agradece con detalles llenos amor.",
  },
  {
    id: "para-pedir-perdon",
    name: "Pedir perdón",
    sheetLabel: "Pedir perdón",
    icon: "🌷",
    description: "Reconecta desde el corazón nuevamente.",
  },
  {
    id: "para-acompanar",
    name: "Para acompañar",
    sheetLabel: "Para acompañar",
    icon: "🤍",
    description: "Acompaña momentos sensibles con cariño.",
  },
];

/**
 * Obtiene categoría por id técnico.
 */
export function getCategoryById(categoryId?: string | null) {
  if (!categoryId) return null;

  return (
    CATEGORIES.find((category) => category.id === categoryId) || null
  );
}

/**
 * Convierte texto humano de Google Sheets en id técnico.
 */
export function getCategoryIdFromSheetLabel(label?: string | null): string {
  if (!label) return "";

  const normalized = label.trim().toLowerCase();

  return (
    CATEGORIES.find(
      (category) =>
        category.sheetLabel.trim().toLowerCase() === normalized
    )?.id || ""
  );
}

/**
 * Obtiene nombre visible desde id técnico.
 */
export function getCategoryName(categoryId?: string | null) {
  return (
    getCategoryById(categoryId)?.name ||
    "Detalle especial"
  );
}



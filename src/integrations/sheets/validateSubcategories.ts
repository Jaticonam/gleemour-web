import type { CatalogSubcategory } from "@/shared/types/product";
import { CATEGORIES } from "@/tenant/config/catalog";

const PUBLIC_SUBCATEGORY_STATUS = "Publicado";

const VALID_CATEGORY_IDS = new Set(
  CATEGORIES.filter((category) => category.id !== "todas").map(
    (category) => category.id,
  ),
);

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function getSubcategoryKey(
  subcategory: CatalogSubcategory,
): string {
  return [
    normalizeIdentifier(subcategory.categoryId),
    normalizeIdentifier(subcategory.id),
  ].join("::");
}

function compareSubcategories(
  a: CatalogSubcategory,
  b: CatalogSubcategory,
): number {
  const priorityDifference = b.priority - a.priority;

  if (priorityDifference !== 0) {
    return priorityDifference;
  }

  return a.name.localeCompare(b.name, "es", {
    sensitivity: "base",
  });
}

export function validateSubcategories(
  subcategories: CatalogSubcategory[],
): CatalogSubcategory[] {
  const seenKeys = new Set<string>();

  return subcategories
    .filter((subcategory) => {
      const normalizedId = normalizeIdentifier(subcategory.id);

      if (!normalizedId) {
        console.warn("Subcategoría descartada: sin subcategory_id", {
          subcategory,
        });
        return false;
      }

      if (!subcategory.categoryId) {
        console.warn(
          "Subcategoría descartada: sin category_id ->",
          subcategory.id,
        );
        return false;
      }

      if (!VALID_CATEGORY_IDS.has(subcategory.categoryId)) {
        console.warn(
          "Subcategoría descartada: category_id inválido ->",
          {
            id: subcategory.id,
            categoryId: subcategory.categoryId,
          },
        );
        return false;
      }

      const subcategoryKey = getSubcategoryKey(subcategory);

      if (seenKeys.has(subcategoryKey)) {
        console.warn(
          "Subcategoría descartada: clave compuesta duplicada ->",
          {
            id: subcategory.id,
            categoryId: subcategory.categoryId,
          },
        );
        return false;
      }

      if (!subcategory.name) {
        console.warn(
          "Subcategoría descartada: sin nombre ->",
          subcategory.id,
        );
        return false;
      }

      if (subcategory.status !== PUBLIC_SUBCATEGORY_STATUS) {
        return false;
      }

      seenKeys.add(subcategoryKey);
      return true;
    })
    .sort(compareSubcategories);
}
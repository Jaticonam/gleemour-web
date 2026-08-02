import type {
  CatalogSubcategory,
  Category,
  Product,
} from "@/shared/types/product";

export interface ArrangementSelection {
  categoryId: string;
  subcategoryKey: string;
  productId: string;
}

export function normalizeArrangementText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function getArrangementSubcategoryKey(
  categoryId: string,
  subcategoryId: string,
): string {
  const normalizedCategoryId =
    normalizeArrangementText(categoryId);

  const normalizedSubcategoryId =
    normalizeArrangementText(subcategoryId);

  if (!normalizedCategoryId || !normalizedSubcategoryId) {
    return "";
  }

  return `${normalizedCategoryId}::${normalizedSubcategoryId}`;
}

export function getExperienceCategories(
  categories: Category[],
): Category[] {
  return categories.filter((category) => {
    const normalizedId = normalizeArrangementText(category.id);

    return normalizedId !== "todas" && normalizedId !== "all";
  });
}

export function filterExperienceSubcategories(
  subcategories: CatalogSubcategory[],
  categoryId: string,
): CatalogSubcategory[] {
  const normalizedCategoryId =
    normalizeArrangementText(categoryId);

  if (!normalizedCategoryId) {
    return [];
  }

  return subcategories.filter(
    (subcategory) =>
      normalizeArrangementText(subcategory.categoryId) ===
      normalizedCategoryId,
  );
}

export function filterExperienceProducts(
  products: Product[],
  categoryId: string,
  subcategory: CatalogSubcategory | null,
): Product[] {
  const normalizedCategoryId =
    normalizeArrangementText(categoryId);

  if (!normalizedCategoryId) {
    return [];
  }

  const categoryProducts = products.filter(
    (product) =>
      normalizeArrangementText(product.category) ===
      normalizedCategoryId,
  );

  if (!subcategory) {
    return [];
  }

  if (
    normalizeArrangementText(subcategory.categoryId) !==
    normalizedCategoryId
  ) {
    return [];
  }

  const normalizedSubcategoryName =
    normalizeArrangementText(subcategory.name);

  if (!normalizedSubcategoryName) {
    return [];
  }

  return categoryProducts.filter((product) =>
    product.subcategories.some(
      (productSubcategory) =>
        normalizeArrangementText(productSubcategory) ===
        normalizedSubcategoryName,
    ),
  );
}

export function resolveInitialArrangementSelection(
  product: Product | null,
  subcategories: CatalogSubcategory[],
): ArrangementSelection {
  if (!product) {
    return {
      categoryId: "",
      subcategoryKey: "",
      productId: "",
    };
  }

  const categoryId = product.category.trim();

  const matchingSubcategory = filterExperienceSubcategories(
    subcategories,
    categoryId,
  ).find((subcategory) => {
    const normalizedSubcategoryName =
      normalizeArrangementText(subcategory.name);

    return product.subcategories.some(
      (productSubcategory) =>
        normalizeArrangementText(productSubcategory) ===
        normalizedSubcategoryName,
    );
  });

  return {
    categoryId,
    subcategoryKey: matchingSubcategory
      ? getArrangementSubcategoryKey(
          matchingSubcategory.categoryId,
          matchingSubcategory.id,
        )
      : "",
    productId: product.id,
  };
}
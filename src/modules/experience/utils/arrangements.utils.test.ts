import { describe, expect, it } from "vitest";

import type {
  CatalogSubcategory,
  Category,
  Product,
} from "@/shared/types/product";

import {
  filterExperienceProducts,
  filterExperienceSubcategories,
  getArrangementSubcategoryKey,
  getExperienceCategories,
  normalizeArrangementText,
  resolveInitialArrangementSelection,
} from "./arrangements.utils";

function createProduct(
  overrides: Partial<Product> = {},
): Product {
  return {
    id: "GLM-001",
    title: "Detalle especial",
    description: "Producto de prueba",
    category: "para-enamorar",
    categories: [],
    subcategories: [],
    price: 100,
    offer_price: null,
    stock: 1,
    img: "/producto.jpg",
    priority: 0,
    status: "Publicado",
    badges: [],
    attributes: [],
    addons: [],
    ...overrides,
  };
}

function createSubcategory(
  overrides: Partial<CatalogSubcategory> = {},
): CatalogSubcategory {
  return {
    id: "primer-detalle",
    categoryId: "para-enamorar",
    name: "Primer detalle",
    icon: "✨",
    description: "",
    priority: 0,
    status: "Publicado",
    ...overrides,
  };
}

describe("arrangements.utils", () => {
  it("normaliza mayúsculas, acentos y espacios", () => {
    expect(
      normalizeArrangementText("  Quiero   PERDÓN  "),
    ).toBe("quiero perdon");
  });

  it("construye una clave compuesta normalizada", () => {
    expect(
      getArrangementSubcategoryKey(
        " Para-Sorprender ",
        " Primer-Detalle ",
      ),
    ).toBe("para-sorprender::primer-detalle");
  });

  it("excluye las categorías virtuales", () => {
    const categories: Category[] = [
      {
        id: "todas",
        name: "Todos",
        icon: "✨",
      },
      {
        id: "para-enamorar",
        name: "Para enamorar",
        icon: "💘",
      },
      {
        id: "para-sorprender",
        name: "Para sorprender",
        icon: "🎁",
      },
    ];

    expect(
      getExperienceCategories(categories).map(
        (category) => category.id,
      ),
    ).toEqual([
      "para-enamorar",
      "para-sorprender",
    ]);
  });

  it("filtra subcategorías por categoría principal", () => {
    const result = filterExperienceSubcategories(
      [
        createSubcategory({
          categoryId: "para-enamorar",
        }),
        createSubcategory({
          categoryId: "para-sorprender",
        }),
      ],
      "para-sorprender",
    );

    expect(result).toHaveLength(1);
    expect(result[0].categoryId).toBe("para-sorprender");
  });

  it("permite el mismo id en categorías diferentes", () => {
    const subcategories = [
      createSubcategory({
        id: "primer-detalle",
        categoryId: "para-enamorar",
      }),
      createSubcategory({
        id: "primer-detalle",
        categoryId: "para-sorprender",
      }),
    ];

    expect(
      filterExperienceSubcategories(
        subcategories,
        "para-enamorar",
      ),
    ).toHaveLength(1);

    expect(
      filterExperienceSubcategories(
        subcategories,
        "para-sorprender",
      ),
    ).toHaveLength(1);
  });

  it(
    "filtra productos por categoría principal y subcategoría seleccionada",
    () => {
      const subcategory = createSubcategory({
        categoryId: "para-enamorar",
        name: "Primer detalle",
      });

      const primaryProduct = createProduct({
        id: "GLM-001",
        category: "para-enamorar",
        subcategories: ["Primer detalle"],
      });

      const secondaryProduct = createProduct({
        id: "GLM-002",
        category: "para-sorprender",
        categories: ["para-enamorar"],
        subcategories: ["Primer detalle"],
      });

      const result = filterExperienceProducts(
        [primaryProduct, secondaryProduct],
        "para-enamorar",
        subcategory,
      );

      expect(result.map((product) => product.id)).toEqual([
        "GLM-001",
      ]);
    },
  );

  it("relaciona productos y subcategorías sin distinguir acentos", () => {
    const subcategory = createSubcategory({
      id: "perdoname",
      categoryId: "pedir-perdon",
      name: "Perdóname",
    });

    const product = createProduct({
      category: "pedir-perdon",
      subcategories: ["  PERDONAME  "],
    });

    expect(
      filterExperienceProducts(
        [product],
        "pedir-perdon",
        subcategory,
      ),
    ).toEqual([product]);
  });

  it(
    "oculta productos mientras no exista una subcategoría seleccionada",
    () => {
      const result = filterExperienceProducts(
        [
          createProduct({
            category: "para-celebrar",
            subcategories: ["Cumpleaños"],
          }),
        ],
        "para-celebrar",
        null,
      );

      expect(result).toEqual([]);
    },
  );

  it("devuelve vacío cuando la subcategoría no tiene productos", () => {
    const result = filterExperienceProducts(
      [
        createProduct({
          category: "para-agradecer",
          subcategories: ["Amistad"],
        }),
      ],
      "para-agradecer",
      createSubcategory({
        categoryId: "para-agradecer",
        id: "equipo-trabajo",
        name: "Equipo de trabajo",
      }),
    );

    expect(result).toEqual([]);
  });

  it("resuelve la selección inicial respetando la categoría", () => {
    const product = createProduct({
      id: "GLM-010",
      category: "para-sorprender",
      subcategories: ["Primer detalle"],
    });

    const selection = resolveInitialArrangementSelection(
      product,
      [
        createSubcategory({
          id: "primer-detalle",
          categoryId: "para-enamorar",
        }),
        createSubcategory({
          id: "primer-detalle",
          categoryId: "para-sorprender",
        }),
      ],
    );

    expect(selection).toEqual({
      categoryId: "para-sorprender",
      subcategoryKey:
        "para-sorprender::primer-detalle",
      productId: "GLM-010",
    });
  });

  it("mantiene la subcategoría vacía cuando no existe coincidencia", () => {
    const selection = resolveInitialArrangementSelection(
      createProduct({
        category: "para-enamorar",
        subcategories: ["No registrada"],
      }),
      [
        createSubcategory({
          categoryId: "para-enamorar",
          name: "Primer detalle",
        }),
      ],
    );

    expect(selection.subcategoryKey).toBe("");
  });
});
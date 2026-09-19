import { describe, expect, it } from "vitest";

import type { Product } from "@/shared/types/product";

import {
  applyCoreMediaAssets,
} from "./JungCoreMediaOverride";

function product(
  overrides: Partial<Product> = {},
): Product {
  return {
    id: "GLECAG001",
    title: "Producto Gleemour",
    description: "Descripción",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: [],
    campaigns: [],
    price: 100,
    offer_price: null,
    stock: 1,
    img: "",
    images: [],
    priority: 1,
    status: "Publicado",
    badges: [],
    attributes: [],
    addons: [],
    music: [],
    ...overrides,
  };
}

describe("applyCoreMediaAssets", () => {
  it("aplica Asset Manifest por ProductCode", () => {
    const result =
      applyCoreMediaAssets(
        [product()],
        {
          assets: [
            {
              publicUrl:
                "https://media.jungnegocios.com/gleemour/products/GLECAG001_01.jpg",
              status: "ACTIVE",
              products: [
                {
                  position: 1,
                  isPrimary: true,
                  product: {
                    sku: "GLECAG001",
                    status: "ACTIVE",
                  },
                },
              ],
            },
          ],
        },
      );

    expect(result[0]?.img).toBe(
      "https://media.jungnegocios.com/gleemour/products/GLECAG001_01.jpg",
    );

    expect(result[0]?.images).toEqual([]);
  });

  it("ordena primary primero y luego por posición", () => {
    const result =
      applyCoreMediaAssets(
        [product()],
        {
          assets: [
            {
              publicUrl:
                "https://media.test/02.jpg",
              status: "ACTIVE",
              products: [
                {
                  position: 2,
                  isPrimary: false,
                  product: {
                    sku: "GLECAG001",
                    status: "ACTIVE",
                  },
                },
              ],
            },
            {
              publicUrl:
                "https://media.test/01.jpg",
              status: "ACTIVE",
              products: [
                {
                  position: 1,
                  isPrimary: true,
                  product: {
                    sku: "GLECAG001",
                    status: "ACTIVE",
                  },
                },
              ],
            },
          ],
        },
      );

    expect(result[0]?.img).toBe(
      "https://media.test/01.jpg",
    );

    expect(result[0]?.images).toEqual([
      "https://media.test/02.jpg",
    ]);
  });

  it("preserva datos comerciales", () => {
    const source =
      product({
        title: "Título comercial",
        price: 149.9,
        stock: 7,
        priority: 99,
      });

    const [result] =
      applyCoreMediaAssets(
        [source],
        {
          assets: [
            {
              publicUrl:
                "https://media.test/01.jpg",
              status: "ACTIVE",
              products: [
                {
                  position: 1,
                  isPrimary: true,
                  product: {
                    sku: "GLECAG001",
                    status: "ACTIVE",
                  },
                },
              ],
            },
          ],
        },
      );

    expect(result?.title).toBe(
      "Título comercial",
    );

    expect(result?.price).toBe(149.9);
    expect(result?.stock).toBe(7);
    expect(result?.priority).toBe(99);
  });

  it("preserva media Sheets si CORE no resuelve SKU", () => {
    const source =
      product({
        img:
          "https://sheet.test/main.jpg",
        images: [
          "https://sheet.test/02.jpg",
        ],
      });

    const [result] =
      applyCoreMediaAssets(
        [source],
        {
          assets: [],
        },
      );

    expect(result).toEqual(source);
  });

  it("ignora asset inactivo", () => {
    const source =
      product({
        img:
          "https://sheet.test/main.jpg",
      });

    const [result] =
      applyCoreMediaAssets(
        [source],
        {
          assets: [
            {
              publicUrl:
                "https://media.test/01.jpg",
              status: "INACTIVE",
              products: [
                {
                  position: 1,
                  isPrimary: true,
                  product: {
                    sku: "GLECAG001",
                    status: "ACTIVE",
                  },
                },
              ],
            },
          ],
        },
      );

    expect(result?.img).toBe(
      "https://sheet.test/main.jpg",
    );
  });
});

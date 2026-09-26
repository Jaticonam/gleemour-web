import type { Product } from "@/shared/types/product";

import type { CatalogVersionSnapshot } from "./CatalogComposition";
import type { CommercialComposition } from "./CommercialOutput";
import type { QuotationSnapshot } from "./QuotationComposition";

export const GLEEMOUR_CATALOG_OUTPUT_VERSION =
  "gleemour.catalog-output.v1" as const;
export const GLEEMOUR_QUOTATION_OUTPUT_VERSION =
  "gleemour.quotation-output.v1" as const;

export interface CatalogOutputProductSnapshot {
  productId: string;
  productCode: string;
  name: string;
  imageUrl: string;
  price: number;
  offerPrice: number | null;
  stock: number | null;
}

export interface CatalogOutputPayload {
  catalog: CatalogVersionSnapshot;
  products: CatalogOutputProductSnapshot[];
}

export type CatalogCommercialComposition = CommercialComposition<CatalogOutputPayload>;
export type QuotationCommercialComposition = CommercialComposition<QuotationSnapshot>;

function toCatalogOutputProduct(product: Product): CatalogOutputProductSnapshot {
  return {
    productId: product.id,
    productCode: product.id,
    name: product.title,
    imageUrl: product.img,
    price: product.price,
    offerPrice: product.offer_price ?? null,
    stock: product.stock,
  };
}

export function createCatalogCommercialComposition(
  catalog: CatalogVersionSnapshot,
  products: readonly Product[],
): CatalogCommercialComposition {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const resolvedProducts = catalog.composition.order
    .map((productId) => productsById.get(productId))
    .filter((product): product is Product => Boolean(product))
    .map(toCatalogOutputProduct);

  return {
    schemaVersion: GLEEMOUR_CATALOG_OUTPUT_VERSION,
    compositionId: catalog.catalogVersionId,
    compositionKind: "catalog",
    version: String(catalog.versionNumber),
    createdAt: catalog.snapshotAt,
    payload: {
      catalog: {
        ...catalog,
        source:
          catalog.source.type === "manual"
            ? { ...catalog.source, productIds: [...catalog.source.productIds] }
            : { ...catalog.source },
        composition: {
          productIds: [...catalog.composition.productIds],
          excludedProductIds: [...catalog.composition.excludedProductIds],
          order: [...catalog.composition.order],
        },
        settings: { ...catalog.settings },
      },
      products: resolvedProducts,
    },
  };
}

export function createQuotationCommercialComposition(
  quotation: QuotationSnapshot,
): QuotationCommercialComposition {
  return {
    schemaVersion: GLEEMOUR_QUOTATION_OUTPUT_VERSION,
    compositionId: quotation.quotationVersionId,
    compositionKind: "quotation",
    version: String(quotation.revision),
    createdAt: quotation.snapshotAt,
    payload: {
      ...quotation,
      client: { ...quotation.client },
      conditions: { ...quotation.conditions },
      lines: quotation.lines.map((line) => ({ ...line })),
      totals: { ...quotation.totals },
    },
  };
}

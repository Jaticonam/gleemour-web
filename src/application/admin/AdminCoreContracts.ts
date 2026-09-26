import type {
  Campaign,
  CatalogSubcategory,
  Product,
} from "@/shared/types/product";

export interface ProductSelection {
  productIds: string[];
}

export function createProductSelection(
  productIds: readonly string[] = [],
): ProductSelection {
  return { productIds: [...new Set(productIds.filter(Boolean))] };
}

export interface ProductRepository {
  listProducts(): Promise<Product[]>;
  getProduct(productId: string): Promise<Product | null>;
}

export interface CatalogReferenceRepository extends ProductRepository {
  listSubcategories(): Promise<CatalogSubcategory[]>;
  listCampaigns(): Promise<Campaign[]>;
}

export interface ProductCapabilities {
  canRead: boolean;
  canEdit: boolean;
  canUpdatePrice: boolean;
  canUpdateStock: boolean;
  canPublish: boolean;
  canArchive: boolean;
}

export interface CatalogCapabilities {
  canCompose: boolean;
  canSaveDraft: boolean;
  canPublish: boolean;
  canArchive: boolean;
}

export interface QuotationCapabilities {
  canCompose: boolean;
  canSaveDraft: boolean;
  canPublishPdf: boolean;
  canSendWhatsapp: boolean;
}

export const ADMIN_CAPABILITIES = {
  products: {
    canRead: true,
    canEdit: false,
    canUpdatePrice: false,
    canUpdateStock: false,
    canPublish: false,
    canArchive: false,
  } satisfies ProductCapabilities,
  catalogs: {
    canCompose: true,
    canSaveDraft: false,
    canPublish: false,
    canArchive: false,
  } satisfies CatalogCapabilities,
  quotations: {
    canCompose: true,
    canSaveDraft: true,
    canPublishPdf: true,
    canSendWhatsapp: true,
  } satisfies QuotationCapabilities,
} as const;

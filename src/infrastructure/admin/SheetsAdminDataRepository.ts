import type {
  CatalogReferenceRepository,
  ProductRepository,
} from "@/application/admin/AdminCoreContracts";
import {
  loadAllCampaigns,
  loadAllProductsForAdmin,
  loadAllSubcategories,
} from "@/integrations/sheets/fetchSheets";

export function createSheetsAdminDataRepository(): CatalogReferenceRepository {
  const listProducts = () => loadAllProductsForAdmin();

  return {
    listProducts,
    async getProduct(productId) {
      const products = await listProducts();
      return products.find((product) => product.id === productId) ?? null;
    },
    listSubcategories: () => loadAllSubcategories(),
    listCampaigns: () => loadAllCampaigns(),
  };
}

export const sheetsAdminDataRepository: ProductRepository &
  CatalogReferenceRepository = createSheetsAdminDataRepository();

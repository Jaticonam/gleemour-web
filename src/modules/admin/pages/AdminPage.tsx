import { useState } from "react";

import { createProductSelection } from "@/application/admin/AdminCoreContracts";
import type { QuotationDocumentPort } from "@/application/admin/QuotationPublishing";
import type { Product } from "@/shared/types/product";

import {
  AdminAppShell,
  type AdminSection,
} from "@/modules/admin/components/AdminAppShell/AdminAppShell";
import { AdminModuleOverview } from "@/modules/admin/components/AdminModuleOverview/AdminModuleOverview";
import {
  CatalogWorkspace,
  type CatalogWorkspaceData,
} from "@/modules/admin/components/CatalogWorkspace/CatalogWorkspace";
import { ProductExplorer } from "@/modules/admin/components/ProductExplorer/ProductExplorer";
import { QuotationWorkspace } from "@/modules/admin/components/QuotationWorkspace/QuotationWorkspace";

interface AdminPageProps {
  loadAdminProducts?: () => Promise<Product[]>;
  loadCatalogWorkspaceData?: () => Promise<CatalogWorkspaceData>;
  loadQuotationProducts?: () => Promise<Product[]>;
  quotationDocumentPort?: QuotationDocumentPort;
}

export default function AdminPage({
  loadAdminProducts,
  loadCatalogWorkspaceData,
  loadQuotationProducts,
  quotationDocumentPort,
}: AdminPageProps) {
  const [section, setSection] = useState<AdminSection>("catalog");
  const [productSelection, setProductSelection] = useState(() =>
    createProductSelection(),
  );
  const setSelectedProductIds = (productIds: string[]) =>
    setProductSelection(createProductSelection(productIds));
  const selectedProductIds = productSelection.productIds;

  return (
    <AdminAppShell activeSection={section} onSectionChange={setSection}>
      {section === "catalog" ? (
        <ProductExplorer
          loadProducts={loadAdminProducts}
          selectedProductIds={selectedProductIds}
          onSelectedProductIdsChange={setSelectedProductIds}
          onPrepareCatalog={() => setSection("catalogs")}
          onPrepareQuotation={() => setSection("quotations")}
        />
      ) : section === "catalogs" ? (
        <CatalogWorkspace
          selectedProductIds={selectedProductIds}
          onSelectedProductIdsChange={setSelectedProductIds}
          onBackToProducts={() => setSection("catalog")}
          loadData={loadCatalogWorkspaceData}
        />
      ) : section === "quotations" ? (
        <QuotationWorkspace
          selectedProductIds={selectedProductIds}
          onSelectedProductIdsChange={setSelectedProductIds}
          onBackToProducts={() => setSection("catalog")}
          loadProducts={loadQuotationProducts}
          documentPort={quotationDocumentPort}
        />
      ) : (
        <AdminModuleOverview section={section} onSectionChange={setSection} />
      )}
    </AdminAppShell>
  );
}

import { useState } from "react";

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

interface AdminPageProps {
  loadAdminProducts?: () => Promise<Product[]>;
  loadCatalogWorkspaceData?: () => Promise<CatalogWorkspaceData>;
}

export default function AdminPage({
  loadAdminProducts,
  loadCatalogWorkspaceData,
}: AdminPageProps) {
  const [section, setSection] = useState<AdminSection>("catalog");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  return (
    <AdminAppShell activeSection={section} onSectionChange={setSection}>
      {section === "catalog" ? (
        <ProductExplorer
          loadProducts={loadAdminProducts}
          selectedProductIds={selectedProductIds}
          onSelectedProductIdsChange={setSelectedProductIds}
          onPrepareCatalog={() => setSection("catalogs")}
        />
      ) : section === "catalogs" ? (
        <CatalogWorkspace
          selectedProductIds={selectedProductIds}
          onSelectedProductIdsChange={setSelectedProductIds}
          onBackToProducts={() => setSection("catalog")}
          loadData={loadCatalogWorkspaceData}
        />
      ) : (
        <AdminModuleOverview section={section} onSectionChange={setSection} />
      )}
    </AdminAppShell>
  );
}

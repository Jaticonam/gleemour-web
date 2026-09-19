import { useState } from "react";

import type { Product } from "@/shared/types/product";

import {
  AdminAppShell,
  type AdminSection,
} from "@/modules/admin/components/AdminAppShell/AdminAppShell";
import { AdminModuleOverview } from "@/modules/admin/components/AdminModuleOverview/AdminModuleOverview";
import { ProductExplorer } from "@/modules/admin/components/ProductExplorer/ProductExplorer";

interface AdminPageProps {
  loadAdminProducts?: () => Promise<Product[]>;
}

export default function AdminPage({ loadAdminProducts }: AdminPageProps) {
  const [section, setSection] = useState<AdminSection>("catalog");

  return (
    <AdminAppShell activeSection={section} onSectionChange={setSection}>
      {section === "catalog" ? (
        <ProductExplorer loadProducts={loadAdminProducts} />
      ) : (
        <AdminModuleOverview section={section} onSectionChange={setSection} />
      )}
    </AdminAppShell>
  );
}

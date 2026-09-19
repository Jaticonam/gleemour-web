import { useState } from "react";

import {
  AdminAppShell,
  type AdminSection,
} from "@/modules/admin/components/AdminAppShell/AdminAppShell";
import { AdminModuleOverview } from "@/modules/admin/components/AdminModuleOverview/AdminModuleOverview";

export default function AdminPage() {
  const [section, setSection] = useState<AdminSection>("catalog");

  return (
    <AdminAppShell activeSection={section} onSectionChange={setSection}>
      <AdminModuleOverview section={section} onSectionChange={setSection} />
    </AdminAppShell>
  );
}

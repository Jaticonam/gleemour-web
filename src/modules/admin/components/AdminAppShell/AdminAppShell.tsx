import "./AdminAppShell.css";

import type { ReactNode } from "react";
import {
  FileText,
  Flower2,
  LayoutGrid,
  ReceiptText,
  Store,
} from "lucide-react";

export type AdminSection = "catalog" | "catalogs" | "quotations";

interface AdminAppShellProps {
  children: ReactNode;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const SECTION_LABELS: Record<AdminSection, string> = {
  catalog: "Catálogo",
  catalogs: "Catálogos",
  quotations: "Cotizaciones",
};

export function AdminAppShell({
  children,
  activeSection,
  onSectionChange,
}: AdminAppShellProps) {
  return (
    <div className="gla-shell">
      <aside className="gla-sidebar">
        <div className="gla-brand">
          <div className="gla-brand-mark" aria-hidden="true">
            <Flower2 size={21} strokeWidth={2.2} />
          </div>

          <div>
            <strong>Gleemour</strong>
            <span>Admin 1.0</span>
          </div>
        </div>

        <nav className="gla-nav" aria-label="Administración Gleemour">
          <button
            type="button"
            className={[
              "gla-nav-item",
              activeSection === "catalog" ? "gla-nav-item-active" : "",
            ].join(" ")}
            aria-current={activeSection === "catalog" ? "page" : undefined}
            onClick={() => onSectionChange("catalog")}
          >
            <LayoutGrid size={18} aria-hidden="true" />
            <span>Catálogo</span>
          </button>

          <button
            type="button"
            className={[
              "gla-nav-item",
              activeSection === "catalogs" ? "gla-nav-item-active" : "",
            ].join(" ")}
            aria-current={activeSection === "catalogs" ? "page" : undefined}
            onClick={() => onSectionChange("catalogs")}
          >
            <FileText size={18} aria-hidden="true" />
            <span>Catálogos</span>
          </button>

          <button
            type="button"
            className={[
              "gla-nav-item",
              activeSection === "quotations" ? "gla-nav-item-active" : "",
            ].join(" ")}
            aria-current={activeSection === "quotations" ? "page" : undefined}
            onClick={() => onSectionChange("quotations")}
          >
            <ReceiptText size={18} aria-hidden="true" />
            <span>Cotizaciones</span>
          </button>
        </nav>

        <a className="gla-store-link" href="/catalogo">
          <Store size={17} aria-hidden="true" />
          <span>Ver tienda</span>
        </a>

        <div className="gla-sidebar-footer">
          <span>Workspace comercial</span>
          <strong>JUNG</strong>
        </div>
      </aside>

      <div className="gla-workspace">
        <header className="gla-topbar">
          <div>
            <strong>Gleemour Admin</strong>
            <span>{SECTION_LABELS[activeSection]}</span>
          </div>

          <div className="gla-version">1.0 · M2A</div>
        </header>

        <main className="gla-main">{children}</main>
      </div>
    </div>
  );
}

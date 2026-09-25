import "./AdminModuleOverview.css";

import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Boxes,
  FileText,
  ReceiptText,
  Sparkles,
} from "lucide-react";

import type { AdminSection } from "@/modules/admin/components/AdminAppShell/AdminAppShell";

interface AdminModuleOverviewProps {
  section: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

interface ModuleContent {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: string;
  nextStep: string;
}

const MODULE_CONTENT: Record<AdminSection, ModuleContent> = {
  catalog: {
    eyebrow: "Product Explorer",
    title: "Productos",
    description:
      "El punto de control para buscar, filtrar y seleccionar todos los productos de Gleemour.",
    icon: Boxes,
    status: "Base preparada",
    nextStep: "Conectar la fuente administrativa de Google Sheets.",
  },
  catalogs: {
    eyebrow: "Catalog Workspace",
    title: "Catálogos",
    description:
      "El espacio para construir catálogos por categoría, subcategoría, campaña o selección personalizada.",
    icon: FileText,
    status: "Contrato pendiente",
    nextStep: "Definir Catalog Composition como capacidad gobernada por JUNG CORE.",
  },
  quotations: {
    eyebrow: "Quotation Workspace",
    title: "Cotizaciones",
    description:
      "El flujo comercial para preparar cantidades, cliente, condiciones y salidas de una cotización.",
    icon: ReceiptText,
    status: "Contrato pendiente",
    nextStep: "Definir Quotation Composition y persistencia en JUNG CORE.",
  },
};

export function AdminModuleOverview({
  section,
  onSectionChange,
}: AdminModuleOverviewProps) {
  const content = MODULE_CONTENT[section];
  const Icon = content.icon;

  return (
    <section className="gla-overview">
      <div className="gla-overview-heading">
        <div>
          <p className="gla-eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>

        <div className="gla-module-icon" aria-hidden="true">
          <Icon size={27} strokeWidth={1.8} />
        </div>
      </div>

      <div className="gla-foundation-card">
        <div className="gla-foundation-status">
          <Sparkles size={17} aria-hidden="true" />
          <span>{content.status}</span>
        </div>

        <h2>Gleemour Admin está en construcción incremental</h2>
        <p>{content.nextStep}</p>

        {section === "catalog" ? (
          <div className="gla-module-actions">
            <button type="button" onClick={() => onSectionChange("catalogs")}>
              Explorar Catálogos
              <ArrowRight size={16} aria-hidden="true" />
            </button>

            <button type="button" onClick={() => onSectionChange("quotations")}>
              Explorar Cotizaciones
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="gla-back-button"
            onClick={() => onSectionChange("catalog")}
          >
            Volver a Productos
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}

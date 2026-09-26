import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Boxes,
  Layers3,
  ListFilter,
  Megaphone,
  MousePointer2,
} from "lucide-react";

import type {
  CatalogCompositionDraft,
  CatalogCompositionMode,
} from "@/application/admin/CatalogComposition";
import type { Campaign, CatalogSubcategory } from "@/shared/types/product";
import { CATEGORIES } from "@/tenant/config/catalog";

interface CatalogBuilderProps {
  draft: CatalogCompositionDraft;
  subcategories: readonly CatalogSubcategory[];
  campaigns: readonly Campaign[];
  selectedProductCount: number;
  onDraftChange: (patch: Partial<CatalogCompositionDraft>) => void;
  onBackToProducts: () => void;
}
interface ModeOption {
  id: CatalogCompositionMode;
  label: string;
  description: string;
  icon: LucideIcon;
}

const MODE_OPTIONS: ModeOption[] = [
  { id: "full", label: "Todos", description: "Todos los productos publicables", icon: Boxes },
  { id: "category", label: "Categoría", description: "Una emoción principal", icon: Layers3 },
  { id: "subcategory", label: "Subcategoría", description: "Una intención específica", icon: ListFilter },
  { id: "campaign", label: "Campaña", description: "Productos de campaña", icon: Megaphone },
  { id: "custom", label: "Personalizado", description: "Selección del Explorer", icon: MousePointer2 },
];

export function CatalogBuilder({
  draft,
  subcategories,
  campaigns,
  selectedProductCount,
  onDraftChange,
  onBackToProducts,
}: CatalogBuilderProps) {
  const categoryOptions = CATEGORIES.filter(
    (category) => category.id !== "todas" && category.id !== "all",
  );
  const subcategoryOptions = subcategories.filter(
    (subcategory) => subcategory.categoryId === draft.categoryId,
  );

  return (
    <aside className="gla-composition-builder">
      <div className="gla-builder-heading">
        <span>01</span>
        <div>
          <strong>Define el alcance</strong>
          <small>Elige cómo construir este catálogo.</small>
        </div>
      </div>

      <div className="gla-mode-grid">
        {MODE_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              type="button"
              key={option.id}
              className={draft.mode === option.id ? "gla-mode-active" : ""}
              aria-pressed={draft.mode === option.id}
              onClick={() => onDraftChange({ mode: option.id })}
            >
              <Icon size={17} aria-hidden="true" />
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </button>
          );
        })}
      </div>

      {draft.mode === "category" || draft.mode === "subcategory" ? (
        <label className="gla-builder-control">
          <span>Categoría</span>
          <select
            value={draft.categoryId}
            onChange={(event) =>
              onDraftChange({ categoryId: event.target.value, subcategoryId: "" })
            }
          >
            <option value="">Selecciona una categoría</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      ) : null}

      {draft.mode === "subcategory" ? (
        <label className="gla-builder-control">
          <span>Subcategoría</span>
          <select
            value={draft.subcategoryId}
            disabled={!draft.categoryId}
            onChange={(event) => onDraftChange({ subcategoryId: event.target.value })}
          >
            <option value="">Selecciona una subcategoría</option>
            {subcategoryOptions.map((subcategory) => (
              <option
                key={`${subcategory.categoryId}:${subcategory.id}`}
                value={subcategory.id}
              >
                {subcategory.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {draft.mode === "campaign" ? (
        <label className="gla-builder-control">
          <span>Campaña</span>
          <select
            value={draft.campaignId}
            onChange={(event) => onDraftChange({ campaignId: event.target.value })}
          >
            <option value="">Selecciona una campaña</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name} · {campaign.computedStatus ?? "sin estado"}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {draft.mode === "custom" ? (
        <div className="gla-custom-summary">
          <MousePointer2 size={18} aria-hidden="true" />
          <div>
            <strong>{selectedProductCount} productos desde Product Explorer</strong>
            <span>La selección se conserva mientras navegas por Admin.</span>
          </div>
          <button type="button" onClick={onBackToProducts}>Editar selección</button>
        </div>
      ) : null}

      <div className="gla-exclusion-note">
        <AlertCircle size={16} aria-hidden="true" />
        <span>
          Ocultos y borradores se muestran como excluidos; nunca pasan a la composición final.
        </span>
      </div>
    </aside>
  );
}

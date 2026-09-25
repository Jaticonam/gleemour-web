import { X } from "lucide-react";

import { getCategoryName } from "@/tenant/config/catalog";

import {
  ALL_ADMIN_FILTERS,
  type ProductQuickFilter,
} from "./ProductExplorer.utils";

interface ActiveProductFiltersProps {
  query: string;
  status: string;
  category: string;
  quickFilter: ProductQuickFilter;
  onQueryClear: () => void;
  onStatusClear: () => void;
  onCategoryClear: () => void;
  onQuickFilterClear: () => void;
  onClearAll: () => void;
}

export function ActiveProductFilters({
  query,
  status,
  category,
  quickFilter,
  onQueryClear,
  onStatusClear,
  onCategoryClear,
  onQuickFilterClear,
  onClearAll,
}: ActiveProductFiltersProps) {
  const filters = [
    query.trim() ? { key: "query", label: `Búsqueda: ${query.trim()}`, clear: onQueryClear } : null,
    status !== ALL_ADMIN_FILTERS ? { key: "status", label: status, clear: onStatusClear } : null,
    category !== ALL_ADMIN_FILTERS
      ? { key: "category", label: getCategoryName(category), clear: onCategoryClear }
      : null,
    quickFilter === "preparation"
      ? { key: "quick", label: "En preparación", clear: onQuickFilterClear }
      : quickFilter === "without-stock"
        ? { key: "quick", label: "Sin stock", clear: onQuickFilterClear }
        : null,
  ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>;

  if (filters.length === 0) return null;

  return (
    <div className="gla-active-filters" aria-label="Filtros activos">
      <span>Filtros activos</span>
      <div>
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={filter.clear}
            aria-label={`Quitar filtro ${filter.label}`}
          >
            {filter.label} <X size={12} aria-hidden="true" />
          </button>
        ))}
      </div>
      <button type="button" className="gla-clear-all-filters" onClick={onClearAll}>
        Limpiar filtros
      </button>
    </div>
  );
}

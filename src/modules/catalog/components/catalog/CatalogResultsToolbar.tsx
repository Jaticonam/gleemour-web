import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { trackCommerceEvent } from "@/core/services/commerceEvents";
import { lazy, Suspense, useRef, useState } from "react";
import {
  EMPTY_PURCHASE_FILTERS,
  type CatalogSort,
  type PurchaseFilters,
} from "@/modules/catalog/pages/CatalogFilters";
import "./CatalogResultsToolbar.css";

const CatalogFiltersDialog = lazy(() => import("./CatalogFiltersDialog"));

interface CatalogResultsToolbarProps {
  title: string;
  count: number;
  filters: PurchaseFilters;
  onFiltersChange: (next: PurchaseFilters) => void;
  sort: CatalogSort;
  onSortChange: (next: CatalogSort) => void;
  subcategories: string[];
}

export function CatalogResultsToolbar({
  title, count, filters, onFiltersChange, sort, onSortChange, subcategories,
}: CatalogResultsToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const priceActive = filters.minPrice !== "" || filters.maxPrice !== "";
  const activeCount = Number(priceActive) + Number(filters.availability !== "all") + Number(Boolean(filters.subcategory));
  const update = (patch: Partial<PurchaseFilters>) => onFiltersChange({ ...filters, ...patch });
  const removeFilter = (patch: Partial<PurchaseFilters>) => {
    trackCommerceEvent({ type: "catalog_filters_cleared", source: "filter_chip", count: 1 });
    update(patch);
  };

  return (
    <div className="catalog-results-toolbar">
      <div className="catalog-results-topline">
        <div className="catalog-results-heading">
          <h2>{title}</h2>
          <p>{count} {count === 1 ? "producto" : "productos"}</p>
        </div>
        <div className="catalog-results-controls">
          <button
            ref={triggerRef}
            type="button"
            className="catalog-results-filter-trigger"
            aria-haspopup="dialog"
            aria-expanded={filterOpen}
            aria-controls="catalog-purchase-filters"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filtros{activeCount > 0 ? ` · ${activeCount}` : ""}
          </button>
          {filterOpen && (
            <Suspense fallback={null}>
              <CatalogFiltersDialog
                open={filterOpen}
                onOpenChange={setFilterOpen}
                triggerRef={triggerRef}
                count={count}
                filters={filters}
                onFiltersChange={onFiltersChange}
                subcategories={subcategories}
                activeCount={activeCount}
              />
            </Suspense>
          )}

          <label className="catalog-results-sort">
            <span>Ordenar</span>
            <select aria-label="Ordenar productos" value={sort}
              onChange={(event) => onSortChange(event.target.value as CatalogSort)}>
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
            </select>
            <ChevronDown size={16} aria-hidden="true" />
          </label>
        </div>
      </div>
      {activeCount > 0 && (
        <div className="catalog-results-active-filters" aria-label="Filtros de compra activos">
          <div className="catalog-results-chips">
            {priceActive && (
              <button type="button" aria-label="Quitar filtro de precio"
                onClick={() => removeFilter({ minPrice: "", maxPrice: "" })}>
                <span>S/ {filters.minPrice || "0"} – {filters.maxPrice || "más"}</span> <X size={14} aria-hidden="true" />
              </button>
            )}
            {filters.availability !== "all" && (
              <button type="button" aria-label="Quitar filtro de disponibilidad"
                onClick={() => removeFilter({ availability: "all" })}>
                <span>{filters.availability === "available" ? "Disponible" : "Últimas unidades"}</span> <X size={14} aria-hidden="true" />
              </button>
            )}
            {filters.subcategory && (
              <button type="button" aria-label={`Quitar filtro de subcategoría: ${filters.subcategory}`}
                title={filters.subcategory}
                onClick={() => removeFilter({ subcategory: "" })}>
                <span>{filters.subcategory}</span> <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>
          <button type="button" className="catalog-results-clear" onClick={() => {
            trackCommerceEvent({ type: "catalog_filters_cleared", source: "filter_chip", count: activeCount });
            onFiltersChange(EMPTY_PURCHASE_FILTERS);
          }}>
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}

import type { RefObject } from "react";
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  EMPTY_PURCHASE_FILTERS,
  type PurchaseFilters,
} from "@/modules/catalog/pages/CatalogFilters";

interface CatalogFiltersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement>;
  count: number;
  filters: PurchaseFilters;
  onFiltersChange: (next: PurchaseFilters) => void;
  subcategories: string[];
  activeCount: number;
}

export default function CatalogFiltersDialog({
  open, onOpenChange, triggerRef, count, filters, onFiltersChange, subcategories, activeCount,
}: CatalogFiltersDialogProps) {
  const update = (patch: Partial<PurchaseFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="catalog-purchase-filters"
        className="catalog-filters-dialog"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Filtrar productos</DialogTitle>
          <DialogDescription>Elige precio, disponibilidad o subcategoría.</DialogDescription>
        </DialogHeader>
        <div className="catalog-filters-fields">
          <fieldset>
            <legend>Precio efectivo (S/)</legend>
            <div className="catalog-filters-price-fields">
              <label>
                Desde
                <input type="number" min="0" step="0.01" inputMode="decimal"
                  value={filters.minPrice} onChange={(event) => update({ minPrice: event.target.value })} />
              </label>
              <label>
                Hasta
                <input type="number" min="0" step="0.01" inputMode="decimal"
                  value={filters.maxPrice} onChange={(event) => update({ maxPrice: event.target.value })} />
              </label>
            </div>
          </fieldset>
          <label>
            Disponibilidad
            <select value={filters.availability}
              onChange={(event) => update({ availability: event.target.value as PurchaseFilters["availability"] })}>
              <option value="all">Todas</option>
              <option value="available">Disponible</option>
              <option value="last-units">Últimas unidades</option>
            </select>
          </label>
          {subcategories.length > 0 && (
            <label>
              Subcategoría
              <select value={filters.subcategory}
                onChange={(event) => update({ subcategory: event.target.value })}>
                <option value="">Todas</option>
                {subcategories.map((label) => <option key={label} value={label}>{label}</option>)}
              </select>
            </label>
          )}
        </div>
        <DialogFooter className="catalog-filters-footer">
          {activeCount > 0 && (
            <button type="button" className="catalog-filters-clear"
              onClick={() => onFiltersChange(EMPTY_PURCHASE_FILTERS)}>
              Limpiar filtros
            </button>
          )}
          <DialogClose asChild>
            <button type="button" className="catalog-filters-apply">
              Ver {count} {count === 1 ? "producto" : "productos"}
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

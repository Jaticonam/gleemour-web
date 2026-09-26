import { List, Rows3, Table2 } from "lucide-react";

import {
  PRODUCT_FIELDS,
  PRODUCT_FIELD_GROUP_LABELS,
  type ProductFieldGroup,
  type ProductFieldKey,
} from "./ProductExplorer.fields";
import type {
  ProductDensity,
  ProductViewMode,
} from "./ProductExplorer.preferences";

interface ProductExplorerViewControlsProps {
  viewMode: ProductViewMode;
  density: ProductDensity;
  visibleColumns: readonly ProductFieldKey[];
  onViewModeChange: (mode: ProductViewMode) => void;
  onDensityChange: (density: ProductDensity) => void;
  onColumnToggle: (field: ProductFieldKey) => void;
  onColumnsReset: () => void;
}

export function ProductExplorerViewControls({
  viewMode,
  density,
  visibleColumns,
  onViewModeChange,
  onDensityChange,
  onColumnToggle,
  onColumnsReset,
}: ProductExplorerViewControlsProps) {
  return (
    <div className="gla-view-controls" aria-label="Preferencias de visualización">
      <div className="gla-view-switch" aria-label="Vista" role="group">
        <span>Vista</span>
        <button type="button" aria-pressed={viewMode === "rows"} onClick={() => onViewModeChange("rows")}>
          <Rows3 size={15} aria-hidden="true" /> Filas
        </button>
        <button type="button" aria-pressed={viewMode === "table"} onClick={() => onViewModeChange("table")}>
          <Table2 size={15} aria-hidden="true" /> Tabla
        </button>
      </div>

      {viewMode === "table" ? (
        <>
          <label className="gla-density-control">
            <span>Densidad</span>
            <select value={density} onChange={(event) => onDensityChange(event.target.value as ProductDensity)}>
              <option value="comfortable">Cómoda</option>
              <option value="compact">Compacta</option>
            </select>
          </label>

          <details className="gla-column-picker">
            <summary><List size={15} aria-hidden="true" /> Columnas</summary>
            <div>
              {(["commercial", "classification", "system"] as ProductFieldGroup[]).map((group) => (
                <fieldset key={group}>
                  <legend>{PRODUCT_FIELD_GROUP_LABELS[group]}</legend>
                  {PRODUCT_FIELDS.filter((field) => field.group === group).map((field) => (
                    <label key={field.key}>
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(field.key)}
                        onChange={() => onColumnToggle(field.key)}
                      />
                      {field.label}
                    </label>
                  ))}
                </fieldset>
              ))}
              <button type="button" onClick={onColumnsReset}>Restablecer columnas</button>
            </div>
          </details>
        </>
      ) : null}
    </div>
  );
}

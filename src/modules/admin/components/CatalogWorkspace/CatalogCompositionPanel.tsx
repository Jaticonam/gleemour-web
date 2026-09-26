import { Eye, Layers3, RotateCcw } from "lucide-react";

import type {
  CatalogCompositionResult,
  CatalogSortMode,
} from "@/application/admin/CatalogComposition";

import { CatalogCompositionRow } from "./CatalogCompositionRow";

interface CatalogCompositionPanelProps {
  composition: CatalogCompositionResult;
  sortMode: CatalogSortMode;
  onMove: (productId: string, direction: "up" | "down") => void;
  onSortModeChange: (mode: CatalogSortMode) => void;
  onExclude: (productId: string) => void;
  onRestore: (productId: string) => void;
  onPreview: () => void;
}
export function CatalogCompositionPanel({
  composition,
  sortMode,
  onMove,
  onSortModeChange,
  onExclude,
  onRestore,
  onPreview,
}: CatalogCompositionPanelProps) {
  return (
    <section className="gla-composition-panel" aria-labelledby="gla-composition-products">
      <header>
        <div>
          <span>02 · Composición</span>
          <h2 id="gla-composition-products">Productos incluidos</h2>
          <p>
            {composition.included.length} listos · {composition.automaticExcluded.length} automáticos · {composition.manuallyExcluded.length} manuales
          </p>
        </div>
        <button
          type="button"
          className="gla-preview-button"
          onClick={onPreview}
          disabled={composition.included.length === 0}
        >
          <Eye size={16} aria-hidden="true" />
          Vista previa
        </button>
      </header>

      <label className="gla-sort-control">
        <span>Orden global</span>
        <select
          aria-label="Orden global"
          value={sortMode}
          onChange={(event) => onSortModeChange(event.target.value as CatalogSortMode)}
        >
          <option value="manual">Manual</option>
          <option value="priority">Prioridad comercial</option>
          <option value="name-asc">Nombre A–Z</option>
          <option value="name-desc">Nombre Z–A</option>
          <option value="price-asc">Precio menor a mayor</option>
          <option value="price-desc">Precio mayor a menor</option>
        </select>
      </label>

      {composition.included.length > 0 ? (
        <div className="gla-composition-list">
          {composition.included.map((product, index) => (
            <CatalogCompositionRow
              key={product.id}
              product={product}
              index={index}
              total={composition.included.length}
              onMove={onMove}
              onExclude={onExclude}
            />
          ))}
        </div>
      ) : (
        <div className="gla-composition-empty">
          <Layers3 size={23} aria-hidden="true" />
          <strong>Aún no hay productos incluidos</strong>
          <span>Completa el alcance o prepara una selección desde Product Explorer.</span>
        </div>
      )}

      {composition.automaticExcluded.length > 0 ? (
        <details className="gla-excluded-products">
          <summary>
            {composition.automaticExcluded.length}{" "}
            {composition.automaticExcluded.length === 1 ? "producto excluido automáticamente" : "productos excluidos automáticamente"}
          </summary>
          <ul>
            {composition.automaticExcluded.map((product) => (
              <li key={product.id}>
                <span>{product.id}</span>
                {product.title}
                <strong>{product.status}</strong>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {composition.manuallyExcluded.length > 0 ? (
        <details className="gla-excluded-products" open>
          <summary>
            {composition.manuallyExcluded.length}{" "}
            {composition.manuallyExcluded.length === 1 ? "producto excluido manualmente" : "productos excluidos manualmente"}
          </summary>
          <ul>
            {composition.manuallyExcluded.map((product) => (
              <li key={product.id}>
                <span>{product.id}</span>
                {product.title}
                <button type="button" onClick={() => onRestore(product.id)}>
                  <RotateCcw size={13} aria-hidden="true" />
                  Restaurar
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <footer className="gla-output-readiness">
        <span>05 · Salida</span>
        <strong>Contrato preparado para JUNG Commercial Publishing</strong>
      </footer>
    </section>
  );
}

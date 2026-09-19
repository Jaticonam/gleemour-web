import { Eye, Layers3 } from "lucide-react";

import type {
  CatalogCompositionMode,
  CatalogCompositionResult,
} from "@/application/admin/CatalogComposition";

import { CatalogCompositionRow } from "./CatalogCompositionRow";

interface CatalogCompositionPanelProps {
  composition: CatalogCompositionResult;
  mode: CatalogCompositionMode;
  onMove: (productId: string, direction: "up" | "down") => void;
  onRemove: (productId: string) => void;
  onPreview: () => void;
}
export function CatalogCompositionPanel({
  composition,
  mode,
  onMove,
  onRemove,
  onPreview,
}: CatalogCompositionPanelProps) {
  return (
    <section className="gla-composition-panel" aria-labelledby="gla-composition-products">
      <header>
        <div>
          <span>02 · Orden y revisión</span>
          <h2 id="gla-composition-products">Productos incluidos</h2>
          <p>
            {composition.included.length} listos · {composition.excluded.length}{" "}
            {composition.excluded.length === 1 ? "excluido" : "excluidos"}
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

      {composition.included.length > 0 ? (
        <div className="gla-composition-list">
          {composition.included.map((product, index) => (
            <CatalogCompositionRow
              key={product.id}
              product={product}
              index={index}
              total={composition.included.length}
              removable={mode === "custom"}
              onMove={onMove}
              onRemove={onRemove}
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

      {composition.excluded.length > 0 ? (
        <details className="gla-excluded-products">
          <summary>
            {composition.excluded.length}{" "}
            {composition.excluded.length === 1 ? "producto excluido" : "productos excluidos"}{" "}
            por estado
          </summary>
          <ul>
            {composition.excluded.map((product) => (
              <li key={product.id}>
                <span>{product.id}</span>
                {product.title}
                <strong>{product.status}</strong>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  );
}

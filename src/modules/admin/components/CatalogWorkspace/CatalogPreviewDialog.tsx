import { ImageOff, X } from "lucide-react";

import type { Product } from "@/shared/types/product";

interface CatalogPreviewDialogProps {
  title: string;
  products: readonly Product[];
  excludedCount: number;
  onClose: () => void;
}
const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function CatalogPreviewDialog({
  title,
  products,
  excludedCount,
  onClose,
}: CatalogPreviewDialogProps) {
  return (
    <div className="gla-preview-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="gla-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gla-preview-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <span>Vista previa comercial</span>
            <h2 id="gla-preview-title">{title || "Catálogo sin título"}</h2>
            <p>
              {products.length} productos listos
              {excludedCount > 0 ? ` · ${excludedCount} excluidos` : ""}
            </p>
          </div>
          <button type="button" aria-label="Cerrar vista previa" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {products.length > 0 ? (
          <div className="gla-preview-grid">
            {products.map((product) => (
              <article key={product.id}>
                <div>
                  <ImageOff size={21} aria-hidden="true" />
                  {product.img ? <img src={product.img} alt="" /> : null}
                </div>
                <span>{product.id}</span>
                <h3>{product.title}</h3>
                <strong>
                  {PEN_FORMATTER.format(product.offer_price ?? product.price)}
                </strong>
              </article>
            ))}
          </div>
        ) : (
          <div className="gla-preview-empty">
            Elige un alcance con productos publicables para generar la vista previa.
          </div>
        )}
      </section>
    </div>
  );
}

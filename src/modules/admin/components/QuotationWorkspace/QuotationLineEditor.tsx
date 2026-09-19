import { ImageOff, Trash2 } from "lucide-react";

import type { QuotationLineSnapshot } from "@/application/admin/QuotationComposition";

interface QuotationLineEditorProps {
  lines: readonly QuotationLineSnapshot[];
  onLineChange: (
    productId: string,
    patch: Partial<Pick<QuotationLineSnapshot, "quantity" | "unitPrice">>,
  ) => void;
  onRemove: (productId: string) => void;
}

const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function getStockLabel(stock: number | null): string {
  if (stock === null) return "Stock sin definir";
  return `${stock} en stock`;
}

export function QuotationLineEditor({
  lines,
  onLineChange,
  onRemove,
}: QuotationLineEditorProps) {
  if (lines.length === 0) {
    return (
      <div className="gla-quotation-empty">
        <strong>No hay productos en la cotización</strong>
        <span>Selecciona productos desde Product Explorer para comenzar.</span>
      </div>
    );
  }

  return (
    <div className="gla-quotation-lines">
      {lines.map((line) => {
        const exceedsStock =
          line.stockSnapshot !== null && line.quantity > line.stockSnapshot;

        return (
          <article className="gla-quotation-line" key={line.productId}>
            <div className="gla-quotation-line-media">
              <ImageOff size={18} aria-hidden="true" />
              {line.imageUrl ? <img src={line.imageUrl} alt="" /> : null}
            </div>

            <div className="gla-quotation-line-product">
              <span>{line.productId} · {line.status}</span>
              <strong>{line.title}</strong>
              <small className={exceedsStock ? "gla-stock-warning" : ""}>
                {getStockLabel(line.stockSnapshot)}
                {exceedsStock ? " · cantidad superior al snapshot" : ""}
              </small>
            </div>

            <label>
              <span>Cantidad</span>
              <input
                type="number"
                min="1"
                step="1"
                value={line.quantity}
                onChange={(event) =>
                  onLineChange(line.productId, {
                    quantity: Number(event.target.value),
                  })
                }
              />
            </label>

            <label>
              <span>Precio unitario</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={line.unitPrice}
                onChange={(event) =>
                  onLineChange(line.productId, {
                    unitPrice: Number(event.target.value),
                  })
                }
              />
              {line.unitPrice !== line.originalUnitPrice ? (
                <small>Base {PEN_FORMATTER.format(line.originalUnitPrice)}</small>
              ) : null}
            </label>

            <div className="gla-quotation-line-subtotal">
              <span>Subtotal</span>
              <strong>{PEN_FORMATTER.format(line.subtotal)}</strong>
            </div>

            <button
              type="button"
              aria-label={`Quitar ${line.title}`}
              onClick={() => onRemove(line.productId)}
            >
              <Trash2 size={15} aria-hidden="true" />
            </button>
          </article>
        );
      })}
    </div>
  );
}

import { ChevronDown, ChevronUp, ImageOff, X } from "lucide-react";

import type { Product } from "@/shared/types/product";

interface CatalogCompositionRowProps {
  product: Product;
  index: number;
  total: number;
  removable: boolean;
  onMove: (productId: string, direction: "up" | "down") => void;
  onRemove: (productId: string) => void;
}
const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function CatalogCompositionRow({
  product,
  index,
  total,
  removable,
  onMove,
  onRemove,
}: CatalogCompositionRowProps) {
  const price = product.offer_price ?? product.price;

  return (
    <article className="gla-composition-row">
      <span className="gla-composition-position">{index + 1}</span>

      <div className="gla-composition-media">
        <ImageOff size={17} aria-hidden="true" />
        {product.img ? <img src={product.img} alt="" loading="lazy" /> : null}
      </div>

      <div className="gla-composition-product">
        <span>{product.id}</span>
        <strong>{product.title}</strong>
        <small>{PEN_FORMATTER.format(price)}</small>
      </div>

      <div className="gla-composition-actions">
        <button
          type="button"
          aria-label={`Subir ${product.title}`}
          onClick={() => onMove(product.id, "up")}
          disabled={index === 0}
        >
          <ChevronUp size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Bajar ${product.title}`}
          onClick={() => onMove(product.id, "down")}
          disabled={index === total - 1}
        >
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        {removable ? (
          <button
            type="button"
            className="gla-composition-remove"
            aria-label={`Quitar ${product.title}`}
            onClick={() => onRemove(product.id)}
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </article>
  );
}

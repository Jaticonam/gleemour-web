import { Eye, ImageOff } from "lucide-react";
import { useState } from "react";

import type { Product } from "@/shared/types/product";
import { getCategoryName } from "@/tenant/config/catalog";

import { getAdminStatusClassName } from "./ProductExplorer.utils";
import {
  formatProductCurrency,
  getProductActivePrice,
} from "./ProductExplorer.fields";

interface AdminProductRowProps {
  product: Product;
  selected?: boolean;
  onToggle?: (productId: string) => void;
  onInspect?: (product: Product) => void;
}

function getStockLabel(stock: number | null): string {
  if (stock === null) return "Sin definir";
  if (stock === 1) return "1 unidad";
  return `${stock} unidades`;
}

export function AdminProductRow({
  product,
  selected = false,
  onToggle,
  onInspect,
}: AdminProductRowProps) {
  const statusClass = getAdminStatusClassName(product.status);
  const activePrice = getProductActivePrice(product);
  const [failedImageSrc, setFailedImageSrc] = useState<string | null>(null);
  const hasImage = Boolean(product.img && failedImageSrc !== product.img);

  return (
    <article className={`gla-product-row${selected ? " gla-product-row-selected" : ""}`}>
      <div className="gla-product-media">
        {hasImage ? (
          <img
            src={product.img}
            alt={product.title}
            loading="lazy"
            onError={() => setFailedImageSrc(product.img)}
          />
        ) : (
          <ImageOff size={28} aria-hidden="true" />
        )}
        <label className="gla-product-selector">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle?.(product.id)}
            aria-label={`Seleccionar ${product.title}`}
          />
          <span aria-hidden="true" />
        </label>
        <span className={`gla-status gla-status-${statusClass}`}>
          {product.status || "Sin estado"}
        </span>
      </div>

      <div className="gla-product-identity">
        <p className="gla-product-occasion">{getCategoryName(product.category)}</p>
        <h2>{product.title}</h2>
        <p className="gla-product-code-line">Ref. {product.id}</p>

        {product.badges.length > 0 ? (
          <div className="gla-product-badges">
            {product.badges.slice(0, 3).map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        ) : null}
      </div>

      <dl className="gla-product-data">
        <div>
          <dt>Precio</dt>
          <dd>
            {formatProductCurrency(activePrice)}
            {activePrice !== product.price ? (
              <small>{formatProductCurrency(product.price)}</small>
            ) : null}
          </dd>
        </div>

        <div>
          <dt>Stock</dt>
          <dd>{getStockLabel(product.stock)}</dd>
        </div>

        <div>
          <dt>Prioridad</dt>
          <dd>{product.priority}</dd>
        </div>
      </dl>

      <div className="gla-product-action">
        <span>{product.updated_at || "Sin fecha de actualización"}</span>
        <button type="button" onClick={() => onInspect?.(product)}>
          <Eye size={15} aria-hidden="true" />
          Ver producto
        </button>
      </div>
    </article>
  );
}

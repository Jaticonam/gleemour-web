import { Eye, ImageOff } from "lucide-react";

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
  return (
    <article className={`gla-product-row${selected ? " gla-product-row-selected" : ""}`}>
      <label className="gla-product-selector">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle?.(product.id)}
          aria-label={`Seleccionar ${product.title}`}
        />
        <span aria-hidden="true" />
      </label>

      <div className="gla-product-media">
        <ImageOff size={20} aria-hidden="true" />
        {product.img ? <img src={product.img} alt="" loading="lazy" /> : null}
      </div>

      <div className="gla-product-identity">
        <div className="gla-product-code-line">
          <span>{product.id}</span>
          <span className={`gla-status gla-status-${statusClass}`}>
            {product.status || "Sin estado"}
          </span>
        </div>

        <h2>{product.title}</h2>
        <p>{getCategoryName(product.category)}</p>

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
          Ver ficha
        </button>
      </div>
    </article>
  );
}

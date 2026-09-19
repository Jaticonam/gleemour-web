import { Eye, ImageOff } from "lucide-react";

import type { Product } from "@/shared/types/product";
import { getCategoryName } from "@/tenant/config/catalog";

import { getAdminStatusClassName } from "./ProductExplorer.utils";

const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

interface AdminProductRowProps {
  product: Product;
  selected?: boolean;
  onToggle?: (productId: string) => void;
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
}: AdminProductRowProps) {
  const statusClass = getAdminStatusClassName(product.status);
  const activePrice =
    product.offer_price && product.offer_price > 0
      ? product.offer_price
      : product.price;
  const productUrl = `/catalogo/producto.html?id=${encodeURIComponent(product.id)}`;

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
            {PEN_FORMATTER.format(activePrice)}
            {activePrice !== product.price ? (
              <small>{PEN_FORMATTER.format(product.price)}</small>
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
        <a href={productUrl} target="_blank" rel="noreferrer">
          <Eye size={15} aria-hidden="true" />
          Ver ficha
        </a>
      </div>
    </article>
  );
}

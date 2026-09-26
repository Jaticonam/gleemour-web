import "./ProductDetailsDrawer.css";

import { useEffect } from "react";
import { X } from "lucide-react";

import type { Product } from "@/shared/types/product";
import { getCategoryName } from "@/tenant/config/catalog";

import { getAdminStatusClassName } from "./ProductExplorer.utils";
import {
  formatProductCurrency,
  getProductActivePrice,
} from "./ProductExplorer.fields";

interface ProductDetailsDrawerProps {
  product: Product | null;
  onClose: () => void;
}

function getStockLabel(stock: number | null): string {
  if (stock === null) return "Sin definir";
  return `${stock} ${stock === 1 ? "unidad" : "unidades"}`;
}

export function ProductDetailsDrawer({
  product,
  onClose,
}: ProductDetailsDrawerProps) {
  useEffect(() => {
    if (!product) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [product, onClose]);

  if (!product) return null;

  const activePrice = getProductActivePrice(product);
  const categories = [
    ...new Set([product.category, ...product.categories].filter(Boolean)),
  ];

  return (
    <div className="gla-product-drawer-layer" role="presentation">
      <button
        type="button"
        className="gla-product-drawer-backdrop"
        aria-label="Cerrar ficha"
        onClick={onClose}
      />
      <aside
        className="gla-product-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gla-product-drawer-title"
      >
        <header>
          <div>
            <span>Ficha de producto</span>
            <strong>Solo lectura</strong>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar ficha de producto">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        {product.img ? (
          <div className="gla-product-drawer-media">
            <img src={product.img} alt={product.title} />
          </div>
        ) : null}

        <section className="gla-product-drawer-identity">
          <div>
            <span>{product.id}</span>
            <span className={`gla-status gla-status-${getAdminStatusClassName(product.status)}`}>
              {product.status || "Sin estado"}
            </span>
          </div>
          <h2 id="gla-product-drawer-title">{product.title}</h2>
          {product.description ? <p>{product.description}</p> : null}
        </section>

        <section className="gla-product-drawer-section">
          <h3>Comercial</h3>
          <dl>
            <div><dt>Precio</dt><dd>{formatProductCurrency(activePrice)}</dd></div>
            {activePrice !== product.price ? (
              <div><dt>Precio anterior</dt><dd>{formatProductCurrency(product.price)}</dd></div>
            ) : null}
            <div><dt>Stock</dt><dd>{getStockLabel(product.stock)}</dd></div>
            <div><dt>Prioridad</dt><dd>{product.priority}</dd></div>
          </dl>
        </section>

        <section className="gla-product-drawer-section">
          <h3>Clasificación</h3>
          <div className="gla-product-drawer-tags">
            {categories.map((category) => (
              <span key={`category-${category}`}>{getCategoryName(category)}</span>
            ))}
            {product.subcategories.map((subcategory) => (
              <span key={`subcategory-${subcategory}`}>{subcategory}</span>
            ))}
            {product.badges.map((badge) => (
              <span key={`badge-${badge}`}>{badge}</span>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}

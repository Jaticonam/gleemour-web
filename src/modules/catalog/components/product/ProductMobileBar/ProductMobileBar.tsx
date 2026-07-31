import { MessageCircle, ShoppingBag } from "lucide-react";

import "./ProductMobileBar.css";

interface ProductMobileBarProps {
  total: number;
  cartCount: number;
  onCartClick: () => void;
  onWhatsApp: () => void;
}

export function ProductMobileBar({
  total,
  cartCount,
  onCartClick,
  onWhatsApp,
}: ProductMobileBarProps) {
  return (
    <aside
      className="product-mobile-bar"
      aria-label="Acciones rápidas del producto"
    >
      <div className="product-mobile-bar-inner">
        <div className="product-mobile-bar-total">
          <span>Total estimado</span>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>

        <button
          type="button"
          className="product-mobile-bar-cart"
          onClick={onCartClick}
          aria-label={
            cartCount > 0
              ? `Abrir pedido con ${cartCount} unidades`
              : "Abrir pedido"
          }
        >
          <ShoppingBag className="w-5 h-5" />

          {cartCount > 0 && (
            <span className="product-mobile-bar-count">{cartCount}</span>
          )}
        </button>

        <button
          type="button"
          className="product-mobile-bar-whatsapp"
          onClick={onWhatsApp}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Consultar</span>
        </button>
      </div>
    </aside>
  );
}

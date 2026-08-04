import {
  MessageCircle,
  Sparkles,
} from "lucide-react";

import "./ProductMobileBar.css";

interface ProductMobileBarProps {
  price: number;
  onPersonalize: () => void;
  onWhatsApp: () => void;
}

export function ProductMobileBar({
  price,
  onPersonalize,
  onWhatsApp,
}: ProductMobileBarProps) {
  return (
    <aside
      className="product-mobile-bar"
      aria-label="Acciones del producto"
    >
      <div className="product-mobile-bar-inner">
        <div className="product-mobile-bar-price">
          <span>Precio</span>
          <strong>S/ {price.toFixed(2)}</strong>
        </div>

        <button
          type="button"
          className="product-mobile-bar-experience"
          onClick={onPersonalize}
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          <span>Personalizar</span>
        </button>

        <button
          type="button"
          className="product-mobile-bar-whatsapp"
          onClick={onWhatsApp}
          aria-label="Consultar este detalle por WhatsApp"
          title="Consultar este detalle por WhatsApp"
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
import { MessageCircle, Sparkles } from "lucide-react";

import "./ProductMobileBar.css";

interface ProductMobileBarProps {
  total: number;
  onPersonalize: () => void;
  onWhatsApp: () => void;
}

export function ProductMobileBar({
  total,
  onPersonalize,
  onWhatsApp,
}: ProductMobileBarProps) {
  return (
    <aside
      className="product-mobile-bar"
      aria-label="Acciones del producto"
    >
      <div className="product-mobile-bar-inner">
        <div className="product-mobile-bar-total">
          <span>Total configurado</span>
          <strong>S/ {total.toFixed(2)}</strong>
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
          aria-label="Continuar por WhatsApp"
          title="Continuar por WhatsApp"
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
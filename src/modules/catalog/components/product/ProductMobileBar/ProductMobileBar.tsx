import { MessageCircle } from "lucide-react";

import "./ProductMobileBar.css";

interface ProductMobileBarProps {
  total: number;
  onWhatsApp: () => void;
}

export function ProductMobileBar({
  total,
  onWhatsApp,
}: ProductMobileBarProps) {
  return (
    <aside
      className="product-mobile-bar"
      aria-label="Finalizar experiencia por WhatsApp"
    >
      <div className="product-mobile-bar-inner">
        <div className="product-mobile-bar-total">
          <span>Total configurado</span>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>

        <button
          type="button"
          className="product-mobile-bar-whatsapp"
          onClick={onWhatsApp}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          <span>Continuar por WhatsApp</span>
        </button>
      </div>
    </aside>
  );
}
import { MessageCircle, Sparkles } from "lucide-react";

import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

interface ProductCardActionsProps {
  productTitle: string;
  onViewDetail: () => void;
  onWhatsApp: () => void;
}

export function ProductCardActions({
  productTitle,
  onViewDetail,
  onWhatsApp,
}: ProductCardActionsProps) {
  return (
    <div className="product-card-actions">
      <button
        type="button"
        onClick={onViewDetail}
        className={[
          "product-card-button",
          "product-card-button-main",
          "product-card-button-primary",
        ].join(" ")}
        aria-label={`Personalizar sorpresa: ${productTitle}`}
      >
        <Sparkles className="w-4 h-4" />
        <span>{PRODUCT_CARD_CONFIG.actions.viewDetail}</span>
      </button>

      <button
        type="button"
        onClick={onWhatsApp}
        className="product-card-button-wa"
        aria-label={`Consultar ${productTitle} por WhatsApp`}
        title="Consultar por WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        <span>WhatsApp</span>
      </button>
    </div>
  );
}
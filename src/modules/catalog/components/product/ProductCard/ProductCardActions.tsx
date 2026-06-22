import {
  CheckCircle,
  MessageCircle,
  PlusCircle,
} from "lucide-react";

import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

interface ProductCardActionsProps {
  available: boolean;
  isPreventa: boolean;
  isInCart: boolean;
  showWhatsAppButton: boolean;
  onAdd: () => void;
  onWhatsApp: () => void;
}

export function ProductCardActions({
  available,
  isPreventa,
  isInCart,
  showWhatsAppButton,
  onAdd,
  onWhatsApp,
}: ProductCardActionsProps) {
  return (
    <div className="product-card-actions">
      <button
        onClick={showWhatsAppButton ? onWhatsApp : onAdd}
        disabled={!available && !showWhatsAppButton}
        className={[
          "product-card-button",
          "product-card-button-main",
          showWhatsAppButton
            ? "product-card-button-whatsapp"
            : available
              ? "product-card-button-primary"
              : "product-card-button-disabled",
        ].join(" ")}
      >
        {showWhatsAppButton ? (
          <>
            <MessageCircle className="w-4 h-4" />
            <span>
              {isPreventa
                ? PRODUCT_CARD_CONFIG.actions.whatsappPreorder
                : PRODUCT_CARD_CONFIG.actions.whatsappSoldOut}
            </span>
          </>
        ) : available ? (
          isInCart ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>{PRODUCT_CARD_CONFIG.actions.addMore}</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>{PRODUCT_CARD_CONFIG.actions.addToCart}</span>
            </>
          )
        ) : (
          <span>{PRODUCT_CARD_CONFIG.actions.soldOut}</span>
        )}
      </button>

      {!showWhatsAppButton && (
        <button
          onClick={onWhatsApp}
          className="product-card-button-wa"
          aria-label="Consultar por WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Consultar</span>
        </button>
      )}
    </div>
  );
}

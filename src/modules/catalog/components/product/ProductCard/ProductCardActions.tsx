import { MessageCircle, Sparkles } from "lucide-react";

interface ProductCardActionsProps {
  productTitle: string;
  onPersonalize: () => void;
  onWhatsApp: () => void;
}

export function ProductCardActions({
  productTitle,
  onPersonalize,
  onWhatsApp,
}: ProductCardActionsProps) {
  return (
    <div className="product-card-actions">
      <button
        type="button"
        onClick={onPersonalize}
        className="product-card-button-personalize"
        aria-label={`Personalizar ${productTitle}`}
        title="Personalizar"
      >
        <Sparkles className="w-4 h-4" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={onWhatsApp}
        className="product-card-button-wa"
        aria-label={`Consultar ${productTitle} por WhatsApp`}
        title="Consultar por WhatsApp"
      >
        <MessageCircle className="w-4 h-4" aria-hidden="true" />
        <span>WhatsApp</span>
      </button>
    </div>
  );
}

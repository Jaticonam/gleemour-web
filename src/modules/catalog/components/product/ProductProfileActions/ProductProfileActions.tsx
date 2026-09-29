import { Heart, MessageCircle, Sparkles } from "lucide-react";

import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";
import type { Product } from "@/shared/types/product";

import "./ProductProfileActions.css";

interface ProductProfileActionsProps {
  product: Product;
  finalPrice: number;
  originalPrice: number;
  hasOffer: boolean;
  onPersonalize: () => void;
  onWhatsApp: () => void;
}

export function ProductProfileActions({
  product,
  finalPrice,
  originalPrice,
  hasOffer,
  onPersonalize,
  onWhatsApp,
}: ProductProfileActionsProps) {
  const description = product.description?.trim() ?? "";
  const needsDetails = description.length > 220;
  const cut = needsDetails ? description.lastIndexOf(" ", 220) : -1;
  const summary = cut > 0 ? `${description.slice(0, cut)}…` : description;

  return (
    <section className="product-profile-actions" aria-label="Precio y acciones del producto">
      <div className="product-profile-actions__price">
        <span>Precio del producto</span>
        {hasOffer && <del>S/ {originalPrice.toFixed(2)}</del>}
        <strong>S/ {finalPrice.toFixed(2)}</strong>
      </div>

      {summary && <p className="product-profile-actions__description">{summary}</p>}

      <div className="product-profile-actions__actions">
        <button
          type="button"
          className="product-profile-actions__whatsapp"
          onClick={onWhatsApp}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          Consultar por WhatsApp
        </button>

        <button
          type="button"
          className="product-profile-actions__experience"
          onClick={onPersonalize}
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          Personalizar experiencia
        </button>
      </div>

      {needsDetails && (
        <div className="product-profile-actions__details">
          <h2>Detalles del producto</h2>
          <p>{description}</p>
        </div>
      )}

      <div className="product-profile-actions__trust">
        <Heart className="w-4 h-4" aria-hidden="true" />
        <span>{PRODUCT_DETAIL_CONFIG.trust.text}</span>
      </div>
    </section>
  );
}

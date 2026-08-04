import {
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import "./ProductProfileActions.css";

interface ProductProfileActionsProps {
  productTitle: string;
  finalPrice: number;
  originalPrice: number;
  hasOffer: boolean;
  onPersonalize: () => void;
  onWhatsApp: () => void;
}

export function ProductProfileActions({
  productTitle,
  finalPrice,
  originalPrice,
  hasOffer,
  onPersonalize,
  onWhatsApp,
}: ProductProfileActionsProps) {
  return (
    <section
      className="product-profile-actions"
      aria-labelledby="product-profile-actions-title"
    >
      <header className="product-profile-actions__header">
        <span className="product-profile-actions__eyebrow">
          Tu detalle seleccionado
        </span>

        <h2 id="product-profile-actions-title">
          Hazlo aún más especial
        </h2>

        <p>
          Agrega complementos, una canción y una dedicatoria en
          Experience Studio.
        </p>
      </header>

      <div className="product-profile-actions__product">
        <span>{productTitle}</span>

        <div className="product-profile-actions__price">
          <small>Precio del detalle</small>

          <strong>S/ {finalPrice.toFixed(2)}</strong>

          {hasOffer ? (
            <del>S/ {originalPrice.toFixed(2)}</del>
          ) : null}
        </div>
      </div>

      <div className="product-profile-actions__actions">
        <button
          type="button"
          className="product-profile-actions__experience"
          onClick={onPersonalize}
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          Personalizar experiencia
        </button>

        <button
          type="button"
          className="product-profile-actions__whatsapp"
          onClick={onWhatsApp}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          Consultar este detalle
        </button>
      </div>

      <div className="product-profile-actions__trust">
        <Heart className="w-4 h-4" aria-hidden="true" />

        <span>{PRODUCT_DETAIL_CONFIG.trust.text}</span>
      </div>
    </section>
  );
}
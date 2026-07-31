import {
  FileText,
  Gift,
  Heart,
  MessageCircle,
  Music,
  Sparkles,
} from "lucide-react";

import type { ProductConfiguration } from "@/modules/catalog/types/ProductConfiguration.types";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import "./ProductOrderSummary.css";

interface ProductOrderSummaryProps {
  productTitle: string;
  unitPrice: number;
  originalPrice: number;
  hasOffer: boolean;
  configuration: ProductConfiguration;
  onPersonalize: () => void;
  onWhatsApp: () => void;
}

export function ProductOrderSummary({
  productTitle,
  unitPrice,
  originalPrice,
  hasOffer,
  configuration,
  onPersonalize,
  onWhatsApp,
}: ProductOrderSummaryProps) {
  const dedication = configuration.dedication.trim();

  return (
    <div className="product-order-summary" aria-live="polite">
      <header className="product-order-summary__header">
        <span>Resumen en vivo</span>
        <h2>Tu sorpresa</h2>
        <p>Revisa cómo estás personalizando este detalle.</p>
      </header>

      <section className="product-order-summary__product">
        <strong>{productTitle}</strong>

        <div className="product-order-summary__price">
          <span>S/</span>
          <strong>{unitPrice.toFixed(2)}</strong>
        </div>

        {hasOffer ? (
          <small>Antes S/ {originalPrice.toFixed(2)}</small>
        ) : null}
      </section>

      <dl className="product-order-summary__breakdown">
        <div>
          <dt>Precio unitario</dt>
          <dd>S/ {unitPrice.toFixed(2)}</dd>
        </div>

        <div>
          <dt>Cantidad</dt>
          <dd>{configuration.quantity}</dd>
        </div>

        <div>
          <dt>Subtotal producto</dt>
          <dd>S/ {configuration.productSubtotal.toFixed(2)}</dd>
        </div>
      </dl>

      <section className="product-order-summary__section">
        <div className="product-order-summary__section-title">
          <Gift className="w-4 h-4" aria-hidden="true" />
          <strong>Complementos</strong>
        </div>

        {configuration.selectedAddons.length > 0 ? (
          <ul>
            {configuration.selectedAddons.map((addon) => (
              <li key={addon.id}>
                <span>
                  {addon.title}
                  {addon.qty > 1 ? ` × ${addon.qty}` : ""}
                </span>

                <strong>
                  + S/ {(addon.price * addon.qty).toFixed(2)}
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>Sin complementos seleccionados.</p>
        )}

        <div className="product-order-summary__section-total">
          <span>Total complementos</span>
          <strong>S/ {configuration.addonsTotal.toFixed(2)}</strong>
        </div>
      </section>

      <section className="product-order-summary__selection">
        <Music className="w-4 h-4" aria-hidden="true" />

        <div>
          <span>Música</span>
          <strong>
            {configuration.selectedMusic?.title || "Sin canción"}
          </strong>
        </div>

        <small>Incluida</small>
      </section>

      <section className="product-order-summary__selection">
        <FileText className="w-4 h-4" aria-hidden="true" />

        <div>
          <span>Dedicatoria</span>
          <strong>
            {dedication
              ? dedication.length > 70
                ? `${dedication.slice(0, 70)}…`
                : dedication
              : "Pendiente"}
          </strong>
        </div>

        <small>Incluida</small>
      </section>

      <div className="product-order-summary__total">
        <span>Total configurado</span>
        <strong>S/ {configuration.configuredTotal.toFixed(2)}</strong>
      </div>

      <div className="product-order-summary__actions">
        <button
          type="button"
          className="product-order-summary__experience"
          onClick={onPersonalize}
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          Personalizar experiencia
        </button>

        <button
          type="button"
          className="product-order-summary__whatsapp"
          onClick={onWhatsApp}
        >
          <MessageCircle className="w-5 h-5" aria-hidden="true" />
          {PRODUCT_DETAIL_CONFIG.actions.whatsappDefault}
        </button>
      </div>

      <div className="product-order-summary__trust">
        <Heart className="w-4 h-4" aria-hidden="true" />
        <span>{PRODUCT_DETAIL_CONFIG.trust.text}</span>
      </div>
    </div>
  );
}
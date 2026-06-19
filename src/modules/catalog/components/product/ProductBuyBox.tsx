import { Heart, MessageCircle, Minus, Plus, PlusCircle } from "lucide-react";

import type { ProductBuyBoxProps } from "./ProductBuyBox.types";

export function ProductBuyBox({
  priceLabel,
  quantityLabel,
  finalPrice,
  originalPrice,
  hasOffer,
  qtyInput,
  effectiveQty,
  total,
  isQtyInputValid,
  available,
  trustText,
  onDecreaseQty,
  onIncreaseQty,
  onQtyInputChange,
  onQtyInputBlur,
  onQtyInputKeyDown,
  onAddToCart,
  onWhatsApp,
}: ProductBuyBoxProps) {
  return (
    <div className="product-detail-buy-box">
      <div className="product-detail-price-box">
        <p>{priceLabel}</p>

        <div className="product-detail-price">
          <span>S/</span>
          <strong>{finalPrice.toFixed(2)}</strong>
        </div>

        {hasOffer && (
          <small>
            Antes S/ {originalPrice.toFixed(2)}
          </small>
        )}
      </div>

      <div className="product-detail-qty-box">
        <p>{quantityLabel}</p>

        <div className="product-detail-qty-control">
          <button
            onClick={onDecreaseQty}
            disabled={effectiveQty <= 1}
            aria-label="Disminuir cantidad"
          >
            <Minus className="w-4 h-4" />
          </button>

          <input
            value={qtyInput}
            onChange={(event) => onQtyInputChange(event.target.value)}
            onBlur={onQtyInputBlur}
            onKeyDown={onQtyInputKeyDown}
            inputMode="numeric"
          />

          <button
            onClick={onIncreaseQty}
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {!isQtyInputValid && (
          <small className="product-detail-error">
            Ingresa una cantidad válida.
          </small>
        )}
      </div>

      <div className="product-detail-total">
        <span>Total estimado</span>
        <strong>S/ {total.toFixed(2)}</strong>
      </div>

      <div className="product-detail-actions">
        <button
          className="product-detail-primary-button"
          onClick={onAddToCart}
          disabled={!available || !isQtyInputValid}
        >
          <PlusCircle className="w-5 h-5" />
          Agregar pedido
        </button>

        <button
          className="product-detail-whatsapp-button"
          onClick={onWhatsApp}
        >
          <MessageCircle className="w-5 h-5" />
          Consultar por WhatsApp
        </button>
      </div>

      <div className="product-detail-trust">
        <Heart className="w-4 h-4" />
        <span>{trustText}</span>
      </div>
    </div>
  );
}

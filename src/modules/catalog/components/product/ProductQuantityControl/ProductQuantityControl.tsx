import { Minus, Plus, ShoppingBag } from "lucide-react";

import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import "./ProductQuantityControl.css";

interface ProductQuantityState {
  qtyInput: string;
  effectiveQty: number;
  total: number;
  isQtyInputValid: boolean;
  updateQty: (qty: number) => void;
  handleQtyInputChange: (value: string) => void;
  handleQtyInputBlur: () => void;
  handleQtyInputKeyDown: (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
}

interface ProductQuantityControlProps {
  quantity: ProductQuantityState;
  unitPrice: number;
}

export function ProductQuantityControl({
  quantity,
  unitPrice,
}: ProductQuantityControlProps) {
  return (
    <section
      className="product-quantity-control"
      aria-labelledby="product-quantity-title"
    >
      <header className="product-quantity-control__header">
        <span className="product-quantity-control__eyebrow">
          <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          Configura tu detalle
        </span>

        <div>
          <h3 id="product-quantity-title">Elige la cantidad</h3>
          <p>
            Precio por unidad:{" "}
            <strong>S/ {unitPrice.toFixed(2)}</strong>
          </p>
        </div>
      </header>

      <div className="product-quantity-control__body">
        <div className="product-quantity-control__input">
          <button
            type="button"
            onClick={() =>
              quantity.updateQty(quantity.effectiveQty - 1)
            }
            disabled={quantity.effectiveQty <= 1}
            aria-label="Disminuir cantidad"
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </button>

          <input
            value={quantity.qtyInput}
            onChange={(event) =>
              quantity.handleQtyInputChange(event.target.value)
            }
            onBlur={quantity.handleQtyInputBlur}
            onKeyDown={quantity.handleQtyInputKeyDown}
            inputMode="numeric"
            aria-label="Cantidad del producto"
            aria-invalid={!quantity.isQtyInputValid}
          />

          <button
            type="button"
            onClick={() =>
              quantity.updateQty(quantity.effectiveQty + 1)
            }
            aria-label="Aumentar cantidad"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="product-quantity-control__subtotal">
          <span>Subtotal del producto</span>
          <strong>S/ {quantity.total.toFixed(2)}</strong>
        </div>
      </div>

      {!quantity.isQtyInputValid ? (
        <p className="product-quantity-control__error">
          {PRODUCT_DETAIL_CONFIG.quantity.invalidMessage}
        </p>
      ) : null}
    </section>
  );
}
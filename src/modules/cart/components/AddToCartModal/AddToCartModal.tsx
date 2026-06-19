import "./AddToCartModal.css";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  X,
  Package,
  Sparkles,
  Heart,
  Flower2,
  CirclePlus,
} from "lucide-react";

import { Product } from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";

interface AddToCartModalProps {
  open: boolean;
  product: Product | null;
  currentQty: number;
  onClose: () => void;
  onAddExtra: (qty: number) => void;
  onOpenCart: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function AddToCartModal({
  open,
  product,
  currentQty,
  onClose,
  onOpenCart,
  secondaryActionLabel,
  onSecondaryAction,
}: AddToCartModalProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!open) return;

    setPulse(true);
    const timer = setTimeout(() => setPulse(false), 180);

    return () => clearTimeout(timer);
  }, [currentQty, open]);

  if (!open || !product) return null;

  return (
    <div className="add-cart-modal-overlay">
      <div className="add-cart-modal-card">
        <div className="add-cart-modal-header">
          <div className="add-cart-modal-title-wrap">
            <div className="add-cart-modal-icon">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div>
              <h3>{BRAND_CONFIG.modal.addedTitle}</h3>
              <p>{product.title}</p>
            </div>
          </div>

          <button onClick={onClose} className="add-cart-modal-close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div
          className={[
            "add-cart-modal-product",
            pulse ? "add-cart-modal-product-pulse" : "",
          ].join(" ")}
        >
          <img
            src={product.img || "/placeholder.svg"}
            alt={product.title}
          />

          <div>
            <p>{BRAND_CONFIG.modal.addedDescription}</p>
            <strong>
              {currentQty} unidad{currentQty !== 1 ? "es" : ""}
            </strong>
          </div>
        </div>

        <div className="add-cart-modal-message">
          <Sparkles className="w-4 h-4" />
          <div>
            <p>{BRAND_CONFIG.modal.questionTitle}</p>
            <span>{BRAND_CONFIG.modal.questionDescription}</span>
          </div>
        </div>

        <div className="add-cart-modal-actions">
          <div className="add-cart-modal-action-grid">
            <button
              onClick={onSecondaryAction ?? onClose}
              className="add-cart-modal-special"
            >
              <Heart className="w-4 h-4" />
              Hacerlo especial
            </button>

            <button
              onClick={onClose}
              className="add-cart-modal-more"
            >
              <CirclePlus className="w-4 h-4" />
              Otro detalle
            </button>
          </div>

          <button
            onClick={onOpenCart}
            className="add-cart-modal-primary"
          >
            <Flower2 className="w-4 h-4" />
            Realizar mi pedido
          </button>
        </div>
      </div>
    </div>
  );
}





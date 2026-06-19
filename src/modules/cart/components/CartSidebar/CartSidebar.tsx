import "./CartSidebar.css";
import { useEffect, useRef, useState } from "react";
import { BRAND_CONFIG } from "@/tenant/config/brand";
import {
  ShoppingBag,
  X,
  Minus,
  Plus,
  Trash2,
  Sparkles,
  MessageCircle,
  Gift,
} from "lucide-react";

import { CartItem } from "@/shared/types/product";
import { getEffectivePrice } from "@/domain/product/pricing";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  savings: number;
  onRemove: (id: string) => void;
  onChangeQty: (id: string, delta: number) => void;
  onSetQty: (id: string, qty: number | null) => void;
  onChangeNote: (id: string, note: string) => void;
  onClearCart?: () => void;
}

function getCartOfferSavings(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    const basePrice = Number(item.price) || 0;

    const offerPrice =
      item.offer_price !== null &&
      item.offer_price !== undefined &&
      Number(item.offer_price) > 0 &&
      Number(item.offer_price) < basePrice
        ? Number(item.offer_price)
        : null;

    if (!offerPrice) return total;

    return total + (basePrice - offerPrice) * item.qty;
  }, 0);
}

function checkout(
  cart: CartItem[],
  total: string,
  savings: number,
  onClearCart: (() => void) | undefined,
  onClose: () => void
) {
  if (cart.length === 0) return;

  let message = `${BRAND_CONFIG.checkout.whatsappTitle}\n\n`;
  message += `${BRAND_CONFIG.checkout.intro}\n\n`;

  cart.forEach((item) => {
    const price = getEffectivePrice(item);
    const subtotal = price * item.qty;
    const note = item.note?.trim().replace(/\s+/g, " ");

    message += `• *${item.title}*\n`;
    message += `  Código: ${item.id}\n`;
    message += `  Cantidad: ${item.qty}\n`;
    message += `  Subtotal: S/${subtotal.toFixed(2)}\n`;

    if (note) {
      message += `  Dedicatoria: ${note}\n`;
    }

    message += "\n";
  });

  message += "━━━━━━━━━━━━━━━\n";
  message += `*${BRAND_CONFIG.cart.totalLabel}: S/${total}*\n`;

  if (savings > 0) {
    message += `Ahorro aplicado: S/${savings.toFixed(2)}\n`;
  }

  message += `\n${BRAND_CONFIG.checkout.closing}`;

  const url = `https://wa.me/${BRAND_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    message
  )}`;

  window.open(url, "_blank");

  setTimeout(() => {
    onClearCart?.();
    onClose();
  }, 300);
}

function QtyInput({
  item,
  onSetQty,
}: {
  item: CartItem;
  onSetQty: (id: string, qty: number | null) => void;
}) {
  const [qtyInput, setQtyInput] = useState(String(item.qty));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setQtyInput(String(item.qty));
    }
  }, [item.qty, isEditing]);

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={qtyInput}
      onFocus={() => setIsEditing(true)}
      onBlur={() => setIsEditing(false)}
      onChange={(e) => {
        const value = e.target.value;

        if (value === "") {
          setQtyInput("");
          onSetQty(item.id, null);
          return;
        }

        if (!/^\d+$/.test(value)) return;

        setQtyInput(value);
        onSetQty(item.id, parseInt(value, 10));
      }}
      className="cart-sidebar-qty-input"
      aria-label={`Cantidad de ${item.title}`}
    />
  );
}

function NoteTextarea({
  item,
  onChangeNote,
}: {
  item: CartItem;
  onChangeNote: (id: string, note: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [item.note]);

  return (
    <div className="cart-sidebar-note-wrap">
      <textarea
        ref={ref}
        rows={1}
        value={item.note || ""}
        onChange={(e) => onChangeNote(item.id, e.target.value)}
        placeholder="Dedicatoria, color favorito, horario de entrega o algún detalle especial."
        className="cart-sidebar-note"
      />
    </div>
  );
}

function CartRow({
  item,
  onRemove,
  onChangeQty,
  onSetQty,
  onChangeNote,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onChangeQty: (id: string, delta: number) => void;
  onSetQty: (id: string, qty: number | null) => void;
  onChangeNote: (id: string, note: string) => void;
}) {
  const activePrice = getEffectivePrice(item);
  const subtotal = activePrice * item.qty;

  const prevQtyRef = useRef(item.qty);
  const [qtyPulse, setQtyPulse] = useState(false);

  useEffect(() => {
    if (prevQtyRef.current !== item.qty) {
      setQtyPulse(true);
      const timer = setTimeout(() => setQtyPulse(false), 220);
      prevQtyRef.current = item.qty;
      return () => clearTimeout(timer);
    }
  }, [item.qty]);

  return (
    <article
      className={[
        "cart-sidebar-item",
        qtyPulse ? "cart-sidebar-item-pulse" : "",
      ].join(" ")}
    >
      <div className="cart-sidebar-item-main">
        <div className="cart-sidebar-item-img">
          <img src={item.img || "/placeholder.svg"} alt={item.title} />
        </div>

        <div className="cart-sidebar-item-info">
          <div className="cart-sidebar-item-top">
            <div>
              <h4>{item.title}</h4>
              <p>{item.id}</p>
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="cart-sidebar-remove"
              aria-label={`Eliminar ${item.title}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="cart-sidebar-item-price-row">
            <div>
              <span>Subtotal</span>
              <strong>S/ {subtotal.toFixed(2)}</strong>
            </div>

            <div className="cart-sidebar-unit-price">
              U: S/ {activePrice.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="cart-sidebar-item-controls">
        <div className="cart-sidebar-qty">
          <button
            onClick={() => onChangeQty(item.id, -1)}
            aria-label={`Disminuir cantidad de ${item.title}`}
          >
            <Minus className="w-4 h-4" />
          </button>

          <QtyInput item={item} onSetQty={onSetQty} />

          <button
            onClick={() => onChangeQty(item.id, 1)}
            aria-label={`Aumentar cantidad de ${item.title}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="cart-sidebar-item-helper">
          <Gift className="w-3.5 h-3.5" />
          <span>Agrega una dedicatoria o detalle especial</span>
        </div>
      </div>

      <NoteTextarea item={item} onChangeNote={onChangeNote} />
    </article>
  );
}

export function CartSidebar({
  isOpen,
  onClose,
  cart,
  totalItems,
  totalPrice,
  savings,
  onRemove,
  onChangeQty,
  onSetQty,
  onChangeNote,
  onClearCart,
}: CartSidebarProps) {
  const offerSavings = getCartOfferSavings(cart);
  const totalSavings = savings + offerSavings;

  if (!isOpen) return null;

  return (
    <div className="cart-sidebar-overlay" onClick={onClose}>
      <aside className="cart-sidebar-panel" onClick={(e) => e.stopPropagation()}>
        <header className="cart-sidebar-header">
          <div className="cart-sidebar-title-wrap">
            <div className="cart-sidebar-icon">
              <ShoppingBag className="w-5 h-5" />
            </div>

            <div>
              <h2>Tu detalle está casi listo ✨</h2>
              <span>
                {cart.length === 1
                  ? "1 sorpresa preparada"
                  : `${cart.length} detalles preparados`}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="cart-sidebar-close"
            aria-label="Cerrar pedido"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="cart-sidebar-body">
          {cart.length === 0 ? (
            <div className="cart-sidebar-empty">
              <ShoppingBag className="w-12 h-12" />
              <p>Aún no has elegido tu detalle</p>
              <small>Explora el catálogo y agrega algo bonito para sorprender.</small>
            </div>
          ) : (
            cart.map((item) => (
              <CartRow
                key={item.id}
                item={item}
                onRemove={onRemove}
                onChangeQty={onChangeQty}
                onSetQty={onSetQty}
                onChangeNote={onChangeNote}
              />
            ))
          )}
        </div>

        <footer className="cart-sidebar-footer">
          {totalSavings > 0 && (
            <div className="cart-sidebar-benefit">
              <div>
                <Sparkles className="w-4 h-4" />
                <span>Ahorro aplicado</span>
              </div>

              <strong>- S/ {totalSavings.toFixed(2)}</strong>
            </div>
          )}

          <div className="cart-sidebar-total-row">
            <div>
              <span>Resumen de tu detalle</span>

              <div className="cart-sidebar-total">
                <small>S/</small>
                <strong>{totalPrice.toFixed(2)}</strong>
              </div>

              <p>Estás a un paso de sorprender a alguien.</p>
            </div>

            <div className="cart-sidebar-units">
              <strong>{totalItems}</strong>
              <span>unidades</span>
            </div>
          </div>

          <div className="cart-sidebar-delivery-note">
            <Sparkles className="w-4 h-4" />
            <span>Coordinamos contigo la entrega y dedicatoria 💌</span>
          </div>

          <button
            onClick={() =>
              checkout(
                cart,
                totalPrice.toFixed(2),
                totalSavings,
                onClearCart,
                onClose
              )
            }
            disabled={cart.length === 0}
            className={[
              "cart-sidebar-checkout",
              cart.length > 0
                ? "cart-sidebar-checkout-active"
                : "cart-sidebar-checkout-disabled",
            ].join(" ")}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Enviar mi sorpresa 💌</span>
          </button>
        </footer>
      </aside>
    </div>
  );
}





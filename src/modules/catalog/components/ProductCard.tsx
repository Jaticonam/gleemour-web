import { useEffect, useState } from "react";
import {
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  MessageCircle,
  Eye,
} from "lucide-react";

import { getEmotionalHint } from "@/domain/product/emotional";
import { getBadgePresentation, sortBadges } from "@/tenant/config/badgeRules";
import { getCategoryName } from "@/tenant/config/categories";

import { CartItem, Product } from "@/shared/types/product";
import { PRODUCT_CARD_CONFIG } from "@/tenant/config/productCard";

import {
  getProductPrice,
  getOriginalProductPrice,
  hasOfferPrice,
  isProductAvailable,
  getProductState,
  getLiveViewers,
} from "@/domain/product";

import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";

interface ProductCardProps {
  product: Product;
  cart?: CartItem[];
  onAddToCart: (product: Product) => void;
  onImageClick?: (src: string, title: string) => void;
}

export function ProductCard({
  product,
  cart = [],
  onAddToCart,
  onImageClick,
}: ProductCardProps) {
  const available = isProductAvailable(product);
  const productState = getProductState(product);
  const isPreventa = productState.type === "preorder";

  const showWhatsAppButton =
    productState.type === "preorder" ||
    productState.type === "sold-out";

  const price = getProductPrice(product);
  const originalPrice = getOriginalProductPrice(product);
  const hasOffer = hasOfferPrice(product);

  const cartItem = cart.find((item) => item.id === product.id);
  const qtyInCart = cartItem?.qty ?? 0;
  const isInCart = qtyInCart > 0;

  const [viewers, setViewers] = useState(getLiveViewers());

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(getLiveViewers());
    }, 6500);

    return () => clearInterval(interval);
  }, []);

  const handleAdd = () => {
    if (!available || isPreventa) return;
    onAddToCart(product);
  };

  const handleWhatsApp = () => {
    const url = buildProductWhatsAppUrl({
      product,
      qty: 1,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  let StockIcon = CheckCircle;
  let stockClass = "product-card-status product-card-status-success";

  switch (productState.type) {
    case "preorder":
      StockIcon = Clock;
      stockClass = "product-card-status product-card-status-preorder";
      break;

    case "sold-out":
      StockIcon = XCircle;
      stockClass = "product-card-status product-card-status-danger";
      break;

    case "last-units":
      StockIcon = AlertTriangle;
      stockClass = "product-card-status product-card-status-danger";
      break;

    case "limited":
      StockIcon = AlertTriangle;
      stockClass = "product-card-status product-card-status-warning";
      break;

    case "unavailable":
      StockIcon = Clock;
      stockClass = "product-card-status product-card-status-muted";
      break;
  }

  return (
    <article className="product-card">
      <div
        className="product-card-image-wrap"
        onClick={() => onImageClick?.(product.img, product.title)}
      >
        <img
          src={product.img || "/placeholder.svg"}
          alt={product.title}
          loading="lazy"
          className={[
            "product-card-image",
            !available && !isPreventa ? "product-card-image-disabled" : "",
          ].join(" ")}
        />

        <div className="product-card-image-overlay">
          <span>Ver detalle</span>
        </div>

        {product.badges && product.badges.length > 0 && (
          <div className="product-card-badges">
            {sortBadges(product.badges)
              .slice(0, 2)
              .map((badge, index) => {
                const presentation = getBadgePresentation(badge);

                return (
                  <span
                    key={`${product.id}-badge-${index}`}
                    className={[
                      "product-card-badge",
                      presentation.className,
                      presentation.animation,
                    ].join(" ")}
                  >
                    {badge}
                  </span>
                );
              })}
          </div>
        )}

        {isInCart && (
          <div className="product-card-cart-badge">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>
              {qtyInCart} {PRODUCT_CARD_CONFIG.badges.inCartSuffix}
            </span>
          </div>
        )}

        {product.attributes?.length > 0 && (
          <div className="product-card-attributes">
            {product.attributes.map((attribute) => {
              const label =
                PRODUCT_CARD_CONFIG.badges.attributes[
                  attribute as keyof typeof PRODUCT_CARD_CONFIG.badges.attributes
                ];

              if (!label) return null;

              return (
                <span
                  key={attribute}
                  className={[
                    "product-card-attribute",
                    `product-card-attribute-${attribute}`,
                  ].join(" ")}
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{product.id}</span>
          <span>{getCategoryName(product.category)}</span>
        </div>

        <h3 className="product-card-title">{product.title}</h3>

        <p className="product-card-hint">{getEmotionalHint(product)}</p>

        <div className="product-card-price-block">
          {isPreventa ? (
            <>
              <span className="product-card-preorder">
                {PRODUCT_CARD_CONFIG.price.preorder}
              </span>

              <small>{PRODUCT_CARD_CONFIG.price.preorderHelp}</small>
            </>
          ) : (
            <div className="product-card-price-wrap">
              {hasOffer && (
                <div className="product-card-price-old">
                  S/ {originalPrice.toFixed(2)}
                </div>
              )}

              <div className="product-card-price">
                <span>S/</span>
                <strong>{price.toFixed(2)}</strong>
              </div>

              {hasOffer ? (
                <small className="product-card-offer-text">
                  {PRODUCT_CARD_CONFIG.price.offerText}
                </small>
              ) : (
                <small>{PRODUCT_CARD_CONFIG.price.defaultText}</small>
              )}
            </div>
          )}
        </div>

        <div className="product-card-social-row">
          <div className={stockClass}>
            <StockIcon className="w-3.5 h-3.5" />
            <span>{productState.label}</span>
          </div>

          {(available || isPreventa) && (
            <div className="product-card-viewers">
              <Eye className="w-3.5 h-3.5" />
              <span>
                {viewers} {PRODUCT_CARD_CONFIG.viewers.suffix}
              </span>
            </div>
          )}
        </div>

        <div className="product-card-actions">
          <button
            onClick={showWhatsAppButton ? handleWhatsApp : handleAdd}
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
              onClick={handleWhatsApp}
              className="product-card-button-wa"
              aria-label="Consultar por WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Consultar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}


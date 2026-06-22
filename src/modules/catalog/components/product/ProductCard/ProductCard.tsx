import "./ProductCard.css";
import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  MessageCircle,
  Eye,
} from "lucide-react";

import { getBadgePresentation, sortBadges } from "@/tenant/config/product";

import { CartItem, Product } from "@/shared/types/product";
import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

import {
  getProductPrice,
  getOriginalProductPrice,
  hasOfferPrice,
  isProductAvailable,
  getProductState,
  getLiveViewers,
} from "@/domain/product";

import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";
import { ProductCardImage } from "./ProductCardImage";
import { ProductCardType } from "./ProductCardType";
import { ProductCardContent } from "./ProductCardContent";
import { ProductCardPrice } from "./ProductCardPrice";
import { ProductCardSocial } from "./ProductCardSocial";

interface ProductCardProps {
  product: Product;
  cart?: CartItem[];
  onAddToCart: (product: Product) => void;
  onImageClick?: (src: string, title: string) => void;
}

const CAMPAIGN_BADGE_KEYS = [
  "feliz día papa",
  "feliz dia papa",
  "día de la madre",
  "dia de la madre",
  "san valentín",
  "san valentin",
  "flores amarillas",
  "navidad",
];

const STATE_BADGE_KEYS = [
  "oferta",
  "más vendido",
  "mas vendido",
  "nuevo",
  "premium",
  "especial",
  "edición limitada",
  "edicion limitada",
  "últimas unidades",
  "ultimas unidades",
  "express",
  "temporada",
];

function normalizeBadge(value: string) {
  return value.trim().toLowerCase();
}

function pickBadgeByKeys(badges: string[], keys: string[]) {
  return badges.find((badge) => keys.includes(normalizeBadge(badge)));
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
    productState.type === "preorder" || productState.type === "sold-out";

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

  const sortedBadges = useMemo(() => {
    return sortBadges(product.badges ?? []);
  }, [product.badges]);

  const campaignBadge = pickBadgeByKeys(sortedBadges, CAMPAIGN_BADGE_KEYS);
  const stateBadge = pickBadgeByKeys(sortedBadges, STATE_BADGE_KEYS);

  const primaryAttribute = product.attributes?.[0];

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
      <ProductCardImage
        product={product}
        available={available}
        isPreventa={isPreventa}
        isInCart={isInCart}
        qtyInCart={qtyInCart}
        campaignBadge={campaignBadge}
        stateBadge={stateBadge}
        onImageClick={onImageClick}
      />

      <ProductCardType attribute={primaryAttribute} />

      <div className="product-card-body">
        <ProductCardContent product={product} />

        <ProductCardPrice
          isPreventa={isPreventa}
          hasOffer={hasOffer}
          price={price}
          originalPrice={originalPrice}
        />

        <ProductCardSocial
          available={available}
          isPreventa={isPreventa}
          stockClass={stockClass}
          StockIcon={StockIcon}
          productStateLabel={productState.label}
          viewers={viewers}
        />

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

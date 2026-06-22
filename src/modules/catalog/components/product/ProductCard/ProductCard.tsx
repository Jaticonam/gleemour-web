import "./ProductCard.css";
import { useEffect, useMemo, useState } from "react";

import { sortBadges } from "@/tenant/config/product";

import { CartItem, Product } from "@/shared/types/product";

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
import { ProductCardActions } from "./ProductCardActions";

import {
  CAMPAIGN_BADGE_KEYS,
  STATE_BADGE_KEYS,
  pickBadgeByKeys,
  getStockPresentation,
} from "./ProductCard.utils";

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

  const { StockIcon, stockClass } = getStockPresentation(productState.type);

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

        <ProductCardActions
          available={available}
          isPreventa={isPreventa}
          isInCart={isInCart}
          showWhatsAppButton={showWhatsAppButton}
          onAdd={handleAdd}
          onWhatsApp={handleWhatsApp}
        />
      </div>
    </article>
  );
}

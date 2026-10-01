import "./ProductCard.css";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getExperienceUrl, getProductUrl } from "@/app/routes/routes";
import { sortBadges } from "@/tenant/config/product";

import type { Product } from "@/shared/types/product";

import {
  getProductPrice,
  getOriginalProductPrice,
  hasOfferPrice,
  isProductAvailable,
  getProductState,
} from "@/domain/product";

import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";
import { trackCommerceEvent } from "@/core/services/commerceEvents";

import { ProductCardImage } from "./ProductCardImage";
import { ProductCardContent } from "./ProductCardContent";
import { ProductCardPrice } from "./ProductCardPrice";
import { ProductCardActions } from "./ProductCardActions";

import {
  CAMPAIGN_BADGE_KEYS,
  STATE_BADGE_KEYS,
  pickBadgeByKeys,
  isUrgencyBadge,
} from "./ProductCard.utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const available = isProductAvailable(product);
  const productState = getProductState(product);
  const isPreventa = productState.type === "preorder";

  const price = getProductPrice(product);
  const originalPrice = getOriginalProductPrice(product);
  const hasOffer = hasOfferPrice(product);

  const sortedBadges = useMemo(() => {
    return sortBadges(product.badges ?? []).filter((badge) => {
      const normalizedBadge = badge.trim().toLowerCase();

      return !isUrgencyBadge(badge) && normalizedBadge !== "oferta";
    });
  }, [product.badges]);

  const campaignBadge = pickBadgeByKeys(sortedBadges, CAMPAIGN_BADGE_KEYS);
  const stateBadge = pickBadgeByKeys(sortedBadges, STATE_BADGE_KEYS);
  const detailUrl = getProductUrl(product);
  const trackOpen = () => trackCommerceEvent({
    type: "catalog_product_open", source: "catalog_card", productId: product.id,
    categoryId: product.category, effectivePrice: price,
  });
  const handlePersonalize = () => {
    trackCommerceEvent({ type: "catalog_product_customize", source: "catalog_card", productId: product.id });
    navigate(getExperienceUrl("producto", product.id));
  };

  const handleWhatsApp = () => {
    const url = buildProductWhatsAppUrl({
      product,
      qty: 1,
    });

    trackCommerceEvent({
      type: "catalog_product_whatsapp_click", source: "catalog_card",
      productId: product.id, effectivePrice: price,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="product-card">
      <ProductCardImage
        product={product}
        available={available}
        isPreventa={isPreventa}
        badge={stateBadge ?? campaignBadge}
        to={detailUrl}
        onOpen={trackOpen}
      />

      <div className="product-card-body">
        <Link className="product-card-detail" to={detailUrl} onClick={trackOpen}>
          <ProductCardContent product={product} />

          <ProductCardPrice
            isPreventa={isPreventa}
            hasOffer={hasOffer}
            price={price}
            originalPrice={originalPrice}
          />
        </Link>

        <ProductCardActions
          productTitle={product.title}
          onPersonalize={handlePersonalize}
          onWhatsApp={handleWhatsApp}
        />
      </div>
    </article>
  );
}

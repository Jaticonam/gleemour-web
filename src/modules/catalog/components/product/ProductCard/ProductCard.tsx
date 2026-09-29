import "./ProductCard.css";
import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getProductUrl } from "@/app/routes/routes";
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
    return sortBadges(product.badges ?? []);
  }, [product.badges]);

  const campaignBadge = pickBadgeByKeys(sortedBadges, CAMPAIGN_BADGE_KEYS);
  const stateBadge = pickBadgeByKeys(sortedBadges, STATE_BADGE_KEYS);
  const detailUrl = getProductUrl(product);
  const trackOpen = () => trackCommerceEvent({
    type: "catalog_product_open", source: "catalog_card", productId: product.id,
    categoryId: product.category, effectivePrice: price,
  });
  const handleViewDetail = () => {
    trackCommerceEvent({ type: "catalog_product_customize", source: "catalog_card", productId: product.id });
    navigate(detailUrl);
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

  const { StockIcon, stockClass } = getStockPresentation(productState.type);

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

          <ProductCardSocial
            stockClass={stockClass}
            StockIcon={StockIcon}
            productStateLabel={productState.label}
          />
        </Link>

        <ProductCardActions
          productTitle={product.title}
          onViewDetail={handleViewDetail}
          onWhatsApp={handleWhatsApp}
        />
      </div>
    </article>
  );
}

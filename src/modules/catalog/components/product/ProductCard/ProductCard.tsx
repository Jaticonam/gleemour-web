import "./ProductCard.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProductUrl } from "@/app/routes/routes";
import { sortBadges } from "@/tenant/config/product";

import type { Product } from "@/shared/types/product";

import {
  getProductPrice,
  getOriginalProductPrice,
  hasOfferPrice,
  isProductAvailable,
  getProductState,
  getLiveViewers,
} from "@/domain/product";

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
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const available = isProductAvailable(product);
  const productState = getProductState(product);
  const isPreventa = productState.type === "preorder";

  const price = getProductPrice(product);
  const originalPrice = getOriginalProductPrice(product);
  const hasOffer = hasOfferPrice(product);

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

  const handleViewDetail = () => {
    navigate(getProductUrl(product));
  };

  const { StockIcon, stockClass } = getStockPresentation(productState.type);

  return (
    <article className="product-card">
      <ProductCardImage
        product={product}
        available={available}
        isPreventa={isPreventa}
        campaignBadge={campaignBadge}
        stateBadge={stateBadge}
        onImageClick={handleViewDetail}
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

        <ProductCardActions onViewDetail={handleViewDetail} />
      </div>
    </article>
  );
}

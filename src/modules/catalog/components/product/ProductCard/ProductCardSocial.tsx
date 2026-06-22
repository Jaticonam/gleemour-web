import { Eye } from "lucide-react";

import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

interface ProductCardSocialProps {
  available: boolean;
  isPreventa: boolean;
  stockClass: string;
  StockIcon: React.ElementType;
  productStateLabel: string;
  viewers: number;
}

export function ProductCardSocial({
  available,
  isPreventa,
  stockClass,
  StockIcon,
  productStateLabel,
  viewers,
}: ProductCardSocialProps) {
  return (
    <div className="product-card-social-row">
      <div className={stockClass}>
        <StockIcon className="w-3.5 h-3.5" />
        <span>{productStateLabel}</span>
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
  );
}

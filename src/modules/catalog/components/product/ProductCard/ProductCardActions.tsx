import { Eye } from "lucide-react";

import { PRODUCT_CARD_CONFIG } from "@/tenant/config/product";

interface ProductCardActionsProps {
  onViewDetail: () => void;
}

export function ProductCardActions({
  onViewDetail,
}: ProductCardActionsProps) {
  return (
    <div className="product-card-actions">
      <button
        type="button"
        onClick={onViewDetail}
        className={[
          "product-card-button",
          "product-card-button-main",
          "product-card-button-primary",
        ].join(" ")}
      >
        <Eye className="w-4 h-4" />
        <span>{PRODUCT_CARD_CONFIG.actions.viewDetail}</span>
      </button>
    </div>
  );
}

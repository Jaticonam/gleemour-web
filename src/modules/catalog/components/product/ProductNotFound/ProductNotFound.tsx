import { ArrowLeft } from "lucide-react";

import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import "./ProductNotFound.css";

interface ProductNotFoundProps {
  onBack: () => void;
}

export function ProductNotFound({ onBack }: ProductNotFoundProps) {
  return (
    <div className="product-detail-empty">
      <p>{PRODUCT_DETAIL_CONFIG.empty.title}</p>

      <button type="button" onClick={onBack}>
        <ArrowLeft className="w-5 h-5" />
        Volver al catálogo
      </button>
    </div>
  );
}

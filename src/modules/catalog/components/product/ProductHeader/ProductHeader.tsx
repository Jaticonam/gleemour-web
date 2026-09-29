import { ArrowLeft, Share2 } from "lucide-react";
import type { ProductHeaderProps } from "./ProductHeader.types";

import "./ProductHeader.css";

export function ProductHeader({
  title,
  onBack,
  onShare,
}: ProductHeaderProps) {
  return (
    <header className="product-detail-header">
      <div className="product-detail-header-inner">
        <button
          type="button"
          onClick={onBack}
          className="product-detail-icon-button"
          aria-label="Volver al catálogo"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="product-detail-header-title">
          <span className="product-detail-header-context">Catálogo / </span>
          <span className="product-detail-header-name">{title}</span>
        </div>

        <button
          type="button"
          onClick={onShare}
          className="product-detail-icon-button"
          aria-label="Compartir"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

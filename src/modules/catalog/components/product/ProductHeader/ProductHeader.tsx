import { ArrowLeft, Share2 } from "lucide-react";
import type { ProductHeaderProps } from "./ProductHeader.types";

export function ProductHeader({
  title,
  code,
  onBack,
  onShare,
}: ProductHeaderProps) {
  return (
    <header className="product-detail-header">
      <div className="product-detail-header-inner">
        <button
          onClick={onBack}
          className="product-detail-icon-button"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="product-detail-header-title">
          <h1>{title}</h1>
          <p>{code}</p>
        </div>

        <button
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



import type { ProductInfoProps } from "./ProductInfo.types";

export function ProductInfo({
  product,
  categoryName,
  descriptionFallback,
  stockClass,
  StockIcon,
  stockLabel,
  available,
  viewers,
}: ProductInfoProps) {
  return (
    <>
      <div className="product-detail-heading">
        <div className="product-detail-topline">
          <span className="product-detail-kicker">
            {categoryName}
          </span>

          <span className="product-detail-code">
            {product.id}
          </span>
        </div>

        <h2 className="product-detail-title">
          {product.title}
        </h2>

        <p className="product-detail-description">
          {product.description || descriptionFallback}
        </p>
      </div>

      <div className="product-detail-meta-row">
        <div className={`product-detail-status ${stockClass}`}>
          <StockIcon className="w-4 h-4" />
          <span>{stockLabel}</span>
        </div>

        {available && (
          <div className="product-detail-viewers">
            <span />
            {viewers} viendo ahora
          </div>
        )}
      </div>
    </>
  );
}

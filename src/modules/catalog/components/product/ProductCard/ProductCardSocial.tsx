interface ProductCardSocialProps {
  stockClass: string;
  StockIcon: React.ElementType;
  productStateLabel: string;
}

export function ProductCardSocial({
  stockClass,
  StockIcon,
  productStateLabel,
}: ProductCardSocialProps) {
  return (
    <div className="product-card-social-row">
      <div className={stockClass}>
        <StockIcon className="w-3.5 h-3.5" />
        <span>{productStateLabel}</span>
      </div>

    </div>
  );
}

import { Check } from "lucide-react";

import {
  getOriginalProductPrice,
  getProductPrice,
  hasOfferPrice,
} from "@/domain/product/pricing";
import type { Product } from "@/shared/types/product";

interface ExperienceProductCardProps {
  product: Product;
  selected: boolean;
  onSelect: (product: Product) => void;
}

export function ExperienceProductCard({
  product,
  selected,
  onSelect,
}: ExperienceProductCardProps) {
  const price = getProductPrice(product);
  const originalPrice = getOriginalProductPrice(product);
  const hasOffer = hasOfferPrice(product);

  return (
    <article
      className={[
        "experience-product-card",
        selected ? "experience-product-card--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="experience-product-card__image">
        <img
          src={product.img || "/placeholder.svg"}
          alt={product.title}
          loading="lazy"
        />

        {selected && (
          <span className="experience-product-card__selected-badge">
            <Check className="w-3 h-3" aria-hidden="true" />
            Seleccionado
          </span>
        )}
      </div>

      <div className="experience-product-card__content">
        <span className="experience-product-card__reference">
          Ref. {product.id}
        </span>

        <h3>{product.title}</h3>

        <div className="experience-product-card__price">
          {hasOffer && (
            <del>S/ {originalPrice.toFixed(2)}</del>
          )}

          <strong>S/ {price.toFixed(2)}</strong>
        </div>

        <span className="experience-product-card__status">
          {product.status}
        </span>

        <button
          type="button"
          onClick={() => onSelect(product)}
          aria-pressed={selected}
        >
          {selected ? (
            <>
              <Check className="w-4 h-4" aria-hidden="true" />
              Arreglo elegido
            </>
          ) : (
            "Elegir este arreglo"
          )}
        </button>
      </div>
    </article>
  );
}
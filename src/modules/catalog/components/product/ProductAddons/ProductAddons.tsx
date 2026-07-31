import { Check, Gift, Plus } from "lucide-react";

import type {
  ProductAddon,
  SelectedProductAddon,
} from "./ProductAddons.types";

import "./ProductAddons.css";

interface ProductAddonsProps {
  addons: ProductAddon[];
  selectedAddons: SelectedProductAddon[];
  onToggleAddon: (addon: ProductAddon) => void;
}

export function ProductAddons({
  addons,
  selectedAddons,
  onToggleAddon,
}: ProductAddonsProps) {
  if (addons.length === 0) return null;

  const isSelected = (addonId: string) =>
    selectedAddons.some((addon) => addon.id === addonId);

  return (
    <section className="product-addons">
      <div className="product-addons-header">
        <span>
          <Gift className="w-4 h-4" />
          Personaliza tu detalle
        </span>

        <h3>Agrega un extra especial</h3>
        <p>Pequeños complementos que hacen el regalo más memorable.</p>
      </div>

      <div className="product-addons-grid">
        {addons.map((addon) => {
          const selected = isSelected(addon.id);

          return (
            <article
              className={
                selected
                  ? "product-addon-card product-addon-card-selected"
                  : "product-addon-card"
              }
              key={addon.id}
            >
              <div className="product-addon-emoji product-addon-media">
                {addon.img ? (
                  <img
                    src={addon.img}
                    alt={addon.title}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <Gift className="w-5 h-5" aria-hidden="true" />
                )}
              </div>

              <div className="product-addon-content">
                <h4>{addon.title}</h4>
                <strong>+ S/ {addon.price.toFixed(2)}</strong>
              </div>

              <button
                type="button"
                className={
                  selected
                    ? "product-addon-button product-addon-button-selected"
                    : "product-addon-button"
                }
                onClick={() => onToggleAddon(addon)}
                aria-label={
                  selected
                    ? `Quitar ${addon.title}`
                    : `Agregar ${addon.title}`
                }
                aria-pressed={selected}
              >
                {selected ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

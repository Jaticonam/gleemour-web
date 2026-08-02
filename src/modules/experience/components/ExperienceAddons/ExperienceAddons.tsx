import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gift,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import { normalizeAddonReference } from "@/domain/product/addons";
import { getProductPrice } from "@/domain/product/pricing";
import type { Addon, Product } from "@/shared/types/product";

import "./ExperienceAddons.css";

interface ExperienceAddonsProps {
  product: Product;
  availableAddons: Addon[];
  selectedAddons: Addon[];
  hasConfiguredAddons: boolean;
  loading: boolean;
  error: string | null;
  onToggleAddon: (addon: Addon) => void;
  onBack: () => void;
  onContinue: () => void;
  onRetry: () => void;
}

export function ExperienceAddons({
  product,
  availableAddons,
  selectedAddons,
  hasConfiguredAddons,
  loading,
  error,
  onToggleAddon,
  onBack,
  onContinue,
  onRetry,
}: ExperienceAddonsProps) {
  const productPrice = getProductPrice(product);

  const selectedAddonIds = new Set(
    selectedAddons.map((addon) =>
      normalizeAddonReference(addon.id),
    ),
  );

  return (
    <section
      className="experience-addons"
      aria-labelledby="experience-addons-title"
    >
      <button
        type="button"
        className="experience-addons__back"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Volver a arreglos
      </button>

      <header className="experience-addons__header">
        <span className="experience-addons__eyebrow">
          <Gift className="w-4 h-4" aria-hidden="true" />
          Personaliza tu detalle
        </span>

        <h1 id="experience-addons-title">
          Agrega un extra especial
        </h1>

        <p>
          Elige uno o varios complementos para hacer tu arreglo aún
          más memorable. También puedes continuar sin agregar extras.
        </p>
      </header>

      <article className="experience-addons__product">
        <div className="experience-addons__product-image">
          <img
            src={product.img || "/placeholder.svg"}
            alt={product.title}
          />
        </div>

        <div className="experience-addons__product-copy">
          <span>Arreglo principal</span>
          <strong>{product.title}</strong>
          <small>Ref. {product.id}</small>
        </div>

        <div className="experience-addons__product-price">
          <span>Precio</span>
          <strong>S/ {productPrice.toFixed(2)}</strong>
        </div>
      </article>

      {loading ? (
        <div
          className="experience-addons__state"
          aria-live="polite"
        >
          <Sparkles className="w-6 h-6" aria-hidden="true" />

          <strong>Preparando los complementos</strong>

          <span>
            Estamos consultando los extras disponibles para este
            arreglo.
          </span>
        </div>
      ) : error ? (
        <div
          className="experience-addons__state experience-addons__state--error"
          role="alert"
        >
          <strong>No pudimos cargar los complementos</strong>

          <span>{error}</span>

          <button type="button" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Intentar nuevamente
          </button>
        </div>
      ) : !hasConfiguredAddons ? (
        <div
          className="experience-addons__state"
          aria-live="polite"
        >
          <Gift className="w-6 h-6" aria-hidden="true" />

          <strong>
            Este arreglo no tiene complementos disponibles
          </strong>

          <span>
            Puedes continuar directamente a la selección musical.
          </span>
        </div>
      ) : availableAddons.length === 0 ? (
        <div
          className="experience-addons__state"
          aria-live="polite"
        >
          <Gift className="w-6 h-6" aria-hidden="true" />

          <strong>
            No hay complementos publicados en este momento
          </strong>

          <span>
            Tu arreglo principal permanece seleccionado y puedes
            continuar sin agregar extras.
          </span>
        </div>
      ) : (
        <section
          className="experience-addons__options"
          aria-labelledby="experience-addon-options-title"
        >
          <div className="experience-addons__section-heading">
            <div>
              <span>Complementos disponibles</span>

              <h2 id="experience-addon-options-title">
                Elige tus favoritos
              </h2>
            </div>

            <small>
              {selectedAddons.length}{" "}
              {selectedAddons.length === 1
                ? "seleccionado"
                : "seleccionados"}
            </small>
          </div>

          <div
            className="experience-addons__grid"
            aria-live="polite"
          >
            {availableAddons.map((addon) => {
              const selected = selectedAddonIds.has(
                normalizeAddonReference(addon.id),
              );

              return (
                <article
                  key={addon.id}
                  className={[
                    "experience-addon-card",
                    selected
                      ? "experience-addon-card--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="experience-addon-card__media">
                    {addon.img ? (
                      <img
                        src={addon.img}
                        alt={addon.title}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <Gift
                        className="w-6 h-6"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="experience-addon-card__content">
                    <span>Complemento</span>
                    <h3>{addon.title}</h3>
                    <strong>
                      + S/ {addon.price.toFixed(2)}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="experience-addon-card__action"
                    onClick={() => onToggleAddon(addon)}
                    aria-label={
                      selected
                        ? `Quitar ${addon.title}`
                        : `Agregar ${addon.title}`
                    }
                    aria-pressed={selected}
                  >
                    {selected ? (
                      <Check
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                    ) : (
                      <Plus
                        className="w-4 h-4"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="experience-addons__continue">
        <div>
          <span>Siguiente paso</span>
          <strong>Elige la música de este momento</strong>
          <small>
            Los complementos son opcionales y puedes continuar sin
            agregar ninguno.
          </small>
        </div>

        <button
          type="button"
          onClick={onContinue}
        >
          Continuar a música
          <ArrowRight
            className="w-4 h-4"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}

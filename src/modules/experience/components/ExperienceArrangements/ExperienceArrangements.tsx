import {
  ArrowLeft,
  ArrowRight,
  Flower2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import type {
  CatalogSubcategory,
  Category,
  Product,
} from "@/shared/types/product";

import { getArrangementSubcategoryKey } from "../../utils/arrangements.utils";
import { ExperienceProductCard } from "./ExperienceProductCard";

import "./ExperienceArrangements.css";

interface ExperienceArrangementsProps {
  categories: Category[];
  visibleSubcategories: CatalogSubcategory[];
  visibleProducts: Product[];
  selectedCategoryId: string;
  selectedSubcategoryKey: string;
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;
  onSelectCategory: (categoryId: string) => void;
  onSelectSubcategory: (
    subcategory: CatalogSubcategory | null,
  ) => void;
  onSelectProduct: (product: Product) => void;
  onContinue: () => void;
  onRetry: () => void;
}

export function ExperienceArrangements({
  categories,
  visibleSubcategories,
  visibleProducts,
  selectedCategoryId,
  selectedSubcategoryKey,
  selectedProduct,
  loading,
  error,
  onSelectCategory,
  onSelectSubcategory,
  onSelectProduct,
  onContinue,
  onRetry,
}: ExperienceArrangementsProps) {
  const selectedCategory =
    categories.find(
      (category) => category.id === selectedCategoryId,
    ) ?? null;

  const selectedSubcategory =
    visibleSubcategories.find(
      (subcategory) =>
        getArrangementSubcategoryKey(
          subcategory.categoryId,
          subcategory.id,
        ) === selectedSubcategoryKey,
    ) ?? null;

  return (
    <section
      className="experience-arrangements"
      aria-labelledby="experience-arrangements-title"
    >
      <header className="experience-arrangements__header">
        <span className="experience-arrangements__eyebrow">
          <Flower2 className="w-4 h-4" aria-hidden="true" />
          Elige el arreglo principal
        </span>

        <h1 id="experience-arrangements-title">
          ¿Qué deseas expresar?
        </h1>

        <p>
          Explora una categoría, elige la intención que mejor representa
          el momento y descubre sus arreglos.
        </p>
      </header>

      <section
        className="experience-arrangements__section"
        aria-labelledby="experience-categories-title"
      >
        <div className="experience-arrangements__section-heading">
          <div>
            <span>Categorías</span>

            <h2 id="experience-categories-title">
              Elige una emoción
            </h2>
          </div>

          <small>{categories.length} opciones</small>
        </div>

        <div
          className="experience-arrangements__category-grid"
          role="group"
          aria-label="Categorías emocionales"
        >
          {categories.map((category) => {
            const selected =
              category.id === selectedCategoryId;

            return (
              <button
                key={category.id}
                type="button"
                className={[
                  "experience-arrangements__category",
                  selected
                    ? "experience-arrangements__category--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => onSelectCategory(category.id)}
                aria-pressed={selected}
              >
                <span
                  className="experience-arrangements__category-icon"
                  aria-hidden="true"
                >
                  {category.icon}
                </span>

                <strong>{category.name}</strong>

                <small>
                  {category.description ||
                    "Encuentra un detalle especial."}
                </small>
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <div
          className="experience-arrangements__state"
          aria-live="polite"
        >
          <Sparkles className="w-6 h-6" aria-hidden="true" />

          <strong>Preparando los arreglos</strong>

          <span>
            Estamos consultando las opciones disponibles para ti.
          </span>
        </div>
      ) : error ? (
        <div
          className="experience-arrangements__state experience-arrangements__state--error"
          role="alert"
        >
          <strong>No pudimos cargar los arreglos</strong>

          <span>{error}</span>

          <button type="button" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Intentar nuevamente
          </button>
        </div>
      ) : !selectedCategory ? (
        <div
          className="experience-arrangements__state"
          aria-live="polite"
        >
          <Flower2 className="w-6 h-6" aria-hidden="true" />

          <strong>Elige una emoción para comenzar</strong>

          <span>
            Sus intenciones aparecerán aquí como fichas.
          </span>
        </div>
      ) : !selectedSubcategory ? (
        <section
          className="experience-arrangements__section"
          aria-labelledby="experience-subcategories-title"
        >
          <div className="experience-arrangements__section-heading">
            <div>
              <span>{selectedCategory.name}</span>

              <h2 id="experience-subcategories-title">
                ¿Cómo quieres decirlo?
              </h2>
            </div>

            <small>
              {visibleSubcategories.length}{" "}
              {visibleSubcategories.length === 1
                ? "intención"
                : "intenciones"}
            </small>
          </div>

          {visibleSubcategories.length > 0 ? (
            <div
              className="experience-arrangements__subcategory-grid"
              aria-label={`Subcategorías de ${selectedCategory.name}`}
            >
              {visibleSubcategories.map((subcategory) => {
                const subcategoryKey =
                  getArrangementSubcategoryKey(
                    subcategory.categoryId,
                    subcategory.id,
                  );

                return (
                  <button
                    key={subcategoryKey}
                    type="button"
                    className="experience-arrangements__subcategory-card"
                    onClick={() =>
                      onSelectSubcategory(subcategory)
                    }
                  >
                    <span
                      className="experience-arrangements__subcategory-card-icon"
                      aria-hidden="true"
                    >
                      {subcategory.icon || "✨"}
                    </span>

                    <span className="experience-arrangements__subcategory-card-copy">
                      <strong>{subcategory.name}</strong>

                      <small>
                        {subcategory.description ||
                          "Descubre los arreglos relacionados con esta intención."}
                      </small>
                    </span>

                    <ArrowRight
                      className="experience-arrangements__subcategory-card-arrow"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              className="experience-arrangements__empty"
              aria-live="polite"
            >
              <strong>
                Esta categoría todavía no tiene intenciones disponibles
              </strong>

              <span>
                Elige otra categoría para continuar explorando.
              </span>
            </div>
          )}
        </section>
      ) : (
        <section
          className="experience-arrangements__section"
          aria-labelledby="experience-products-title"
        >
          <button
            type="button"
            className="experience-arrangements__back"
            onClick={() => onSelectSubcategory(null)}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Volver a las intenciones
          </button>

          <div className="experience-arrangements__section-heading">
            <div>
              <span>{selectedCategory.name}</span>

              <h2 id="experience-products-title">
                {selectedSubcategory.name}
              </h2>
            </div>

            <small>
              {visibleProducts.length}{" "}
              {visibleProducts.length === 1
                ? "arreglo"
                : "arreglos"}
            </small>
          </div>

          {selectedSubcategory.description && (
            <p className="experience-arrangements__subcategory-description">
              {selectedSubcategory.description}
            </p>
          )}

          {visibleProducts.length > 0 ? (
            <div
              className="experience-arrangements__product-grid"
              aria-live="polite"
            >
              {visibleProducts.map((product) => (
                <ExperienceProductCard
                  key={product.id}
                  product={product}
                  selected={selectedProduct?.id === product.id}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div
              className="experience-arrangements__empty"
              aria-live="polite"
            >
              <strong>
                No encontramos arreglos para esta intención
              </strong>

              <span>
                Regresa a las fichas y prueba otra opción.
              </span>

              <button
                type="button"
                onClick={() => onSelectSubcategory(null)}
              >
                Volver a las intenciones
              </button>
            </div>
          )}

          {selectedProduct && (
            <div className="experience-arrangements__continue">
              <div>
                <span>Arreglo elegido</span>
                <strong>{selectedProduct.title}</strong>
              </div>

              <button
                type="button"
                onClick={onContinue}
              >
                Continuar con este arreglo
                <ArrowRight
                  className="w-4 h-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
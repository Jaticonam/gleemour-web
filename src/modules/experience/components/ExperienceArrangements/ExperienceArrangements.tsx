import {
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
  onRetry: () => void;
  onContinue: () => void;
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
  onRetry,
  onContinue,
}: ExperienceArrangementsProps) {
  const selectedCategory =
    categories.find(
      (category) => category.id === selectedCategoryId,
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
          Comienza eligiendo una emoción. Luego podrás precisar la
          intención y encontrar los arreglos relacionados.
        </p>
      </header>

      <section
        className="experience-arrangements__section"
        aria-labelledby="experience-categories-title"
      >
        <div className="experience-arrangements__section-heading">
          <div>
            <span>Paso 1</span>
            <h2 id="experience-categories-title">
              Selecciona una categoría
            </h2>
          </div>

          <small>{categories.length} emociones</small>
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
            Las subcategorías y los arreglos aparecerán aquí.
          </span>
        </div>
      ) : (
        <>
          <section
            className="experience-arrangements__section"
            aria-labelledby="experience-subcategories-title"
          >
            <div className="experience-arrangements__section-heading">
              <div>
                <span>Paso 2</span>

                <h2 id="experience-subcategories-title">
                  Precisa la intención
                </h2>
              </div>

              <small>{selectedCategory.name}</small>
            </div>

            {visibleSubcategories.length > 0 ? (
              <div
                className="experience-arrangements__subcategory-list"
                role="group"
                aria-label={`Subcategorías de ${selectedCategory.name}`}
              >
                <button
                  type="button"
                  className={[
                    "experience-arrangements__subcategory",
                    selectedSubcategoryKey === ""
                      ? "experience-arrangements__subcategory--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onSelectSubcategory(null)}
                  aria-pressed={selectedSubcategoryKey === ""}
                >
                  <span aria-hidden="true">✨</span>
                  <strong>Ver todos</strong>
                </button>

                {visibleSubcategories.map((subcategory) => {
                  const subcategoryKey =
                    getArrangementSubcategoryKey(
                      subcategory.categoryId,
                      subcategory.id,
                    );

                  const selected =
                    subcategoryKey === selectedSubcategoryKey;

                  return (
                    <button
                      key={subcategoryKey}
                      type="button"
                      className={[
                        "experience-arrangements__subcategory",
                        selected
                          ? "experience-arrangements__subcategory--selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        onSelectSubcategory(subcategory)
                      }
                      aria-pressed={selected}
                      title={subcategory.description || undefined}
                    >
                      <span aria-hidden="true">
                        {subcategory.icon}
                      </span>

                      <strong>{subcategory.name}</strong>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="experience-arrangements__section-note">
                Esta categoría no necesita una intención adicional.
                Puedes elegir directamente uno de sus arreglos.
              </p>
            )}
          </section>

          <section
            className="experience-arrangements__section"
            aria-labelledby="experience-products-title"
          >
            <div className="experience-arrangements__section-heading">
              <div>
                <span>Paso 3</span>

                <h2 id="experience-products-title">
                  Elige tu arreglo
                </h2>
              </div>

              <small>
                {visibleProducts.length}{" "}
                {visibleProducts.length === 1
                  ? "resultado"
                  : "resultados"}
              </small>
            </div>

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
                  No encontramos arreglos para esta selección
                </strong>

                <span>
                  Prueba otra intención o vuelve a ver toda la
                  categoría.
                </span>

                {selectedSubcategoryKey && (
                  <button
                    type="button"
                    onClick={() => onSelectSubcategory(null)}
                  >
                    Ver toda la categoría
                  </button>
                )}
              </div>
            )}
          </section>

          <footer className="experience-arrangements__footer">
            <div aria-live="polite">
              <span>Arreglo seleccionado</span>

              <strong>
                {selectedProduct
                  ? selectedProduct.title
                  : "Todavía no has elegido uno"}
              </strong>
            </div>

            <button
              type="button"
              className="experience-arrangements__continue"
              onClick={onContinue}
              disabled={!selectedProduct}
            >
              Continuar a presentación
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </footer>
        </>
      )}
    </section>
  );
}
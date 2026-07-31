import { ArrowRight, Sparkles } from "lucide-react";

import { CATEGORIES } from "@/tenant/config/catalog/categories";

import "./ProductIntentionNav.css";

interface ProductIntentionNavProps {
  activeCategory: string;
  onSelect: (categoryId: string) => void;
}

export function ProductIntentionNav({
  activeCategory,
  onSelect,
}: ProductIntentionNavProps) {
  const intentions = CATEGORIES.filter(
    (category) => category.id !== "todas",
  );

  const activeIntention =
    intentions.find((category) => category.id === activeCategory) ?? null;

  return (
    <aside
      className="product-intention-nav"
      aria-label="Intenciones Gleemour"
    >
      <header className="product-intention-nav__header">
        <span className="product-intention-nav__eyebrow">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          Intenciones Gleemour
        </span>

        <h2>¿Qué quieres expresar?</h2>

        <p>
          {activeIntention?.description ||
            "Explora detalles creados para cada emoción."}
        </p>
      </header>

      <nav className="product-intention-nav__list">
        {intentions.map((category) => {
          const selected = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              className={[
                "product-intention-nav__item",
                selected ? "product-intention-nav__item--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(category.id)}
              aria-current={selected ? "page" : undefined}
              aria-label={`Explorar ${category.name}`}
            >
              <span className="product-intention-nav__icon">
                {category.icon}
              </span>

              <span className="product-intention-nav__copy">
                <strong>{category.name}</strong>
                <small>{category.description}</small>
              </span>

              <ArrowRight
                className="product-intention-nav__arrow"
                aria-hidden="true"
              />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
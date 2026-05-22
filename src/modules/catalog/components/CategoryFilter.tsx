import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { Category } from "@/shared/types/product";

interface CategoryFilterProps {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({
  categories,
  active,
  onSelect,
}: CategoryFilterProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const allCategory =
    categories.find((c) => c.id === "todas") ??
    categories.find((c) => c.id === "all") ??
    categories[0];

  const scrollableCategories = categories.filter(
    (c) => c.id !== allCategory?.id
  );

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;

    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 8);
  };

  useEffect(() => {
    updateScrollState();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = Math.max(el.clientWidth * 0.72, 180);

    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const getButtonClass = (id: string) =>
    active === id
      ? "category-chip category-chip-active"
      : "category-chip";

  return (
    <section className="category-filter">
      
      {/* Desktop */}
      <div className="category-filter-desktop">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            title={c.name}
            className={getButtonClass(c.id)}
          >
            <span className="category-chip-icon">{c.icon}</span>
            <span className="category-chip-name">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Mobile */}
      <div className="category-filter-mobile">
        <div className="category-filter-mobile-row">
          {allCategory && (
            <button
              type="button"
              onClick={() => onSelect(allCategory.id)}
              title={allCategory.name}
              className={`${getButtonClass(allCategory.id)} category-chip-fixed`}
            >
              <span className="category-chip-icon">{allCategory.icon}</span>
              <span className="category-chip-name">{allCategory.name}</span>
            </button>
          )}

          <div className="category-scroll-wrap">
            {canScrollLeft && <div className="category-fade category-fade-left" />}
            {canScrollRight && <div className="category-fade category-fade-right" />}

            <div ref={scrollRef} className="category-scroll">
              {scrollableCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  title={c.name}
                  className={getButtonClass(c.id)}
                >
                  <span className="category-chip-icon">{c.icon}</span>
                  <span className="category-chip-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            aria-label="Ver más categorías"
            className={[
              "category-more-button",
              canScrollRight ? "category-more-button-visible" : "category-more-button-disabled",
            ].join(" ")}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
}

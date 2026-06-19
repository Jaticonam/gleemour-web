import "./SearchInput.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BRAND_CONFIG } from "@/tenant/config/brand";
import type { Product } from "@/shared/types/product";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  products?: Product[];
  placeholder?: string;
}

const MAX_SUGGESTIONS = 6;

const QUICK_SEARCHES = ["Naturales", "Artificiales", "Corporativo"];

const SEARCH_SYNONYMS: Record<string, string[]> = {
  natural: ["natural", "naturales"],
  naturales: ["natural", "naturales"],

  artificial: ["artificial", "artificiales"],
  artificiales: ["artificial", "artificiales"],

  corporativo: ["corporativo", "corporativos", "corporate"],
  corporativos: ["corporativo", "corporativos", "corporate"],
  corporate: ["corporativo", "corporativos", "corporate"],
};

function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getSearchVariants(value: string): string[] {
  const normalized = normalizeSearchText(value);
  return SEARCH_SYNONYMS[normalized] ?? [normalized];
}

function highlightMatch(text: string, query: string) {
  const cleanQuery = query.trim();

  if (!cleanQuery) return text;

  const index = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .indexOf(
      cleanQuery
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    );

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + cleanQuery.length);
  const after = text.slice(index + cleanQuery.length);

  return (
    <>
      {before}
      <mark className="search-match">{match}</mark>
      {after}
    </>
  );
}

export function SearchInput({
  value,
  onChange,
  products = [],
  placeholder = BRAND_CONFIG.search.placeholder,
}: SearchInputProps) {
  const navigate = useNavigate();

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  const term = value.trim();
  const hasValue = term.length > 0;

  const suggestions = useMemo(() => {
    const searchTerm = normalizeSearchText(term);

    if (!searchTerm) return [];

    const searchVariants = getSearchVariants(searchTerm);

    return products
      .filter((p) => {
        const attributes = Array.isArray(p.attributes)
          ? p.attributes.join(" ")
          : "";

        const fields = [
          p.title,
          p.id,
          p.category,
          p.description,
          p.occasion,
          p.message,
          p.highlight,
          attributes,
        ];

        return fields.some((field) => {
          const normalizedField = normalizeSearchText(field);

          return searchVariants.some((variant) =>
            normalizedField.includes(variant)
          );
        });
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [term, products]);

  const hasSuggestions = suggestions.length > 0;
  const showSuggestions = isOpen && hasValue && hasSuggestions;
  const showQuickSearches = isOpen && !hasValue;
  const showEmptyState = isOpen && hasValue && !hasSuggestions;

  const footerIndex = suggestions.length;
  const totalOptions = suggestions.length + 1;

  const closeSuggestions = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const clearSearch = () => {
    onChange("");
    closeSuggestions();
    inputRef.current?.focus();
  };

  const goToProduct = (product: Product) => {
    const currentSearch = term;

    onChange("");
    closeSuggestions();

    navigate(`/catalogo/producto.html?id=${product.id}&cat=${product.category}`, {
      state: {
        fromSearch: true,
        searchQuery: currentSearch,
      },
    });
  };

  const goToCatalogSearch = () => {
    if (!term) return;

    closeSuggestions();

    navigate("/catalogo", {
      state: {
        fromSearch: true,
        searchQuery: term,
      },
    });
  };

  const applyQuickSearch = (item: string) => {
    onChange(item);

    setActiveIndex(-1);

    setTimeout(() => {
      setIsOpen(true);
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (hasValue) {
        clearSearch();
      } else {
        closeSuggestions();
      }

      return;
    }

    if (e.key === "ArrowDown") {
      if (!hasSuggestions) return;

      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      if (!hasSuggestions) return;

      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        goToProduct(suggestions[activeIndex]);
        return;
      }

      closeSuggestions();

      requestAnimationFrame(() => {
        inputRef.current?.focus();

        const length = inputRef.current?.value.length ?? 0;
        inputRef.current?.setSelectionRange(length, length);
      });

      goToCatalogSearch();

      return;
    }
  };

  useEffect(() => {
    setActiveIndex(-1);

    if (hasValue) {
      setIsOpen(true);
    }
  }, [value, hasValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapRef.current) return;

      if (!wrapRef.current.contains(event.target as Node)) {
        closeSuggestions();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleGlobalShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalShortcut);

    return () => {
      window.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, []);

  return (
    <div ref={wrapRef} className="search-input-wrap">
      <div className="search-input-box">
        <Search className="search-input-icon" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={`${placeholder} · ${products.length} detalles disponibles`}
          className="search-input-field"
          role="combobox"
          aria-expanded={showSuggestions || showQuickSearches}
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-activedescendant={
            activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined
          }
        />

        <kbd className="search-input-shortcut">/</kbd>

        {hasValue && (
          <button
            type="button"
            onClick={clearSearch}
            className="search-input-clear"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showQuickSearches && (
        <div className="search-quick-panel">
          <span className="search-quick-title">Búsquedas rápidas</span>

          <div className="search-quick-list">
            {QUICK_SEARCHES.map((item) => (
              <button
                key={item}
                type="button"
                className="search-quick-chip"
                onClick={() => applyQuickSearch(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {showEmptyState && (
        <div className="search-empty-panel">
          <div className="search-empty-icon">
            <Search className="w-5 h-5" />
          </div>

          <div>
            <p>No encontramos “{term}”</p>
            <span>Prueba con una búsqueda más general o usa una sugerencia rápida.</span>
          </div>

          <div className="search-empty-actions">
            {QUICK_SEARCHES.map((item) => (
              <button
                key={item}
                type="button"
                className="search-empty-chip"
                onClick={() => applyQuickSearch(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSuggestions && (
        <div
          id="search-suggestions"
          className="search-suggestions"
          role="listbox"
        >
          {suggestions.map((p, index) => (
            <button
              key={p.id}
              id={`search-suggestion-${index}`}
              type="button"
              role="option"
              aria-selected={activeIndex === index}
              onMouseEnter={() => {
                if (activeIndex !== -1) {
                  setActiveIndex(index);
                }
              }}
              onClick={() => goToProduct(p)}
              className={[
                "search-suggestion-item",
                activeIndex === index ? "search-suggestion-item-active" : "",
              ].join(" ")}
            >
              <img
                src={p.img || "/placeholder.svg"}
                alt={p.title}
                loading="lazy"
              />

              <div>
                <p>{highlightMatch(p.title, term)}</p>
                <span>
                  {p.category} · {p.id}
                </span>
              </div>

              <Sparkles className="search-suggestion-action" />
            </button>
          ))}

          <button
            type="button"
            onMouseEnter={() => setActiveIndex(footerIndex)}
            onClick={goToCatalogSearch}
            className={[
              "search-suggestion-footer",
              activeIndex === footerIndex
                ? "search-suggestion-footer-active"
                : "",
            ].join(" ")}
          >
            <span>Ver todos los resultados</span>
            <ArrowRight className="search-suggestion-footer-icon" />
          </button>
        </div>
      )}
    </div>
  );
}







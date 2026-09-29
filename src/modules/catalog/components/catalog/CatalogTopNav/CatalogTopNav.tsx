import { useEffect, useRef, useState } from "react";
import { Compass, X } from "lucide-react";

import "./CatalogTopNav.css";

import type { CatalogTopNavProps } from "./CatalogTopNav.types";

export function CatalogTopNav({
  campaignItems,
  categoryItems,
  activeCampaign = "",
  activeCategory = "todas",
  activeDiscover = "",
  discoverItems = [],
  campaignCounts = {},
  categoryCounts = {},
  onCampaignSelect,
  onCategorySelect,
  onDiscoverSelect,
  searchSlot,
  logoSlot,
  headingSlot,
  helpSlot,
}: CatalogTopNavProps) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreTrigger = useRef<HTMLButtonElement>(null);
  const exploreSheet = useRef<HTMLDivElement>(null);
  const hasCampaigns = campaignItems.length > 0;

  useEffect(() => {
    if (!exploreOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = exploreTrigger.current;
    document.body.style.overflow = "hidden";
    exploreSheet.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExploreOpen(false);
      if (event.key !== "Tab") return;
      const buttons = exploreSheet.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeys);
      trigger?.focus();
    };
  }, [exploreOpen]);

  const handleCampaignSelect = (id: string) => {
    onCampaignSelect?.(id);
    setExploreOpen(false);
  };

  const handleCategorySelect = (id: string) => {
    onCategorySelect?.(id);
    setExploreOpen(false);
  };

  return (
    <>
      <header className="catalog-top-nav">
        <div className="catalog-top-nav-brand-row">
          {logoSlot}
          <p>Detalles para emocionar</p>
          <button
            ref={exploreTrigger}
            type="button"
            className="catalog-explore-fab"
            aria-expanded={exploreOpen}
            aria-controls="catalog-explore-sheet"
            onClick={() => setExploreOpen(true)}
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            Explorar
          </button>
        </div>

        <div className="catalog-top-nav-heading">{headingSlot}</div>

        <nav className="catalog-top-nav-categories" aria-label="Categorías">
          {categoryItems.map((item) => {
            const isActive = activeCategory === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={[
                  "catalog-category-chip",
                  isActive ? "active" : "",
                ].join(" ")}
                onClick={() => handleCategorySelect(item.id)}
              >
                {item.icon && (
                  <span className="catalog-category-icon">{item.icon}</span>
                )}

                <span>{item.name}</span>

                {categoryCounts[item.id] !== undefined && (
                  <small>({categoryCounts[item.id]})</small>
                )}
              </button>
            );
          })}
        </nav>

        <div className="catalog-top-nav-search-row">
          <div className="catalog-top-nav-search">{searchSlot}</div>
          {helpSlot}
        </div>

        {discoverItems.length > 0 && (
          <div className="catalog-discover-row" role="group" aria-label="Descubre">
            <span className="catalog-discover-label">Descubre</span>
            <div className="catalog-discover-chips">
              <button
                type="button"
                className={`catalog-discover-chip ${!activeDiscover ? "active" : ""}`}
                aria-pressed={!activeDiscover}
                onClick={() => onDiscoverSelect?.("")}
              >
                Todos
              </button>
              {discoverItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`catalog-discover-chip ${activeDiscover === item.id ? "active" : ""}`}
                  aria-pressed={activeDiscover === item.id}
                  onClick={() => onDiscoverSelect?.(activeDiscover === item.id ? "" : item.id)}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasCampaigns && (
          <div className="catalog-top-nav-campaign-row">
            <span className="catalog-campaign-row-label">
              Campañas
            </span>

            <div className="catalog-top-nav-campaigns">
              {campaignItems.map((item) => {
                const isActive = activeCampaign === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      "catalog-campaign-chip",
                      item.colorClass ?? "",
                      isActive ? "active" : "",
                    ].join(" ")}
                    onClick={() =>
                      handleCampaignSelect(isActive ? "" : item.id)
                    }
                  >
                    <span className="catalog-campaign-content">
                      <strong>{item.name}</strong>

                      {campaignCounts[item.id] !== undefined && (
                        <small>{campaignCounts[item.id]} productos</small>
                      )}
                    </span>

                    {item.icon && (
                      <span className="catalog-campaign-icon">
                        {item.icon}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </header>

      {exploreOpen && (
        <div className="catalog-explore-overlay">
          <button
            type="button"
            className="catalog-explore-backdrop"
            onClick={() => setExploreOpen(false)}
            aria-label="Cerrar explorar"
          />

          <div ref={exploreSheet} className="catalog-explore-sheet" id="catalog-explore-sheet" role="dialog"
            aria-modal="true" aria-labelledby="catalog-explore-title">
            <div className="catalog-explore-header">
              <div>
                <span>Explorar catálogo</span>
                <h3 id="catalog-explore-title">Encuentra el detalle ideal</h3>
              </div>

              <button type="button" aria-label="Cerrar explorar" onClick={() => setExploreOpen(false)}>
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="catalog-explore-group">
              <p>Categorías emocionales</p>

              <div className="catalog-explore-list">
                {categoryItems.map((item) => {
                  const isActive = activeCategory === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={[
                        "catalog-explore-chip",
                        isActive ? "active" : "",
                      ].join(" ")}
                      onClick={() => handleCategorySelect(item.id)}
                    >
                      <span>{item.icon}</span>
                      {item.name}

                      {categoryCounts[item.id] !== undefined && (
                        <small>({categoryCounts[item.id]})</small>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasCampaigns && (
              <div className="catalog-explore-group">
                <p>Campañas activas</p>

                <div className="catalog-explore-list">
                  {campaignItems.map((item) => {
                    const isActive = activeCampaign === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={[
                          "catalog-explore-chip",
                          "catalog-explore-campaign-chip",
                          item.colorClass ?? "",
                          isActive ? "active" : "",
                        ].join(" ")}
                        onClick={() =>
                          handleCampaignSelect(isActive ? "" : item.id)
                        }
                      >
                        <span>{item.icon}</span>
                        {item.name}

                        {campaignCounts[item.id] !== undefined && (
                          <small>({campaignCounts[item.id]})</small>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

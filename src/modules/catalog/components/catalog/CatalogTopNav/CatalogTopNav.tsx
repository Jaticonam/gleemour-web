import { useState } from "react";
import { Compass, X } from "lucide-react";

import "./CatalogTopNav.css";

import type { CatalogTopNavProps } from "./CatalogTopNav.types";

export function CatalogTopNav({
  campaignItems,
  categoryItems,
  activeCampaign = "",
  activeCategory = "todas",
  campaignCounts = {},
  categoryCounts = {},
  onCampaignSelect,
  onCategorySelect,
  searchSlot,
  logoSlot,
}: CatalogTopNavProps) {
  const [exploreOpen, setExploreOpen] = useState(false);

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
      <div className="catalog-top-nav">
        <div className="catalog-top-nav-primary">
          <div className="catalog-top-nav-logo">{logoSlot}</div>

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
                  onClick={() => onCampaignSelect?.(isActive ? "" : item.id)}
                >
                  <span className="catalog-campaign-content">
                    <strong>{item.name}</strong>

                    {campaignCounts[item.id] !== undefined && (
                      <small>{campaignCounts[item.id]} productos</small>
                    )}
                  </span>

                  {item.icon && (
                    <span className="catalog-campaign-icon">{item.icon}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="catalog-top-nav-search">{searchSlot}</div>
        </div>

        <div className="catalog-top-nav-secondary">
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
                onClick={() => onCategorySelect?.(item.id)}
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
        </div>
      </div>

      <button
        type="button"
        className="catalog-explore-fab"
        onClick={() => setExploreOpen(true)}
      >
        <Compass className="w-4 h-4" />
        Explorar
      </button>

      {exploreOpen && (
        <div className="catalog-explore-overlay">
          <button
            type="button"
            className="catalog-explore-backdrop"
            onClick={() => setExploreOpen(false)}
            aria-label="Cerrar explorar"
          />

          <div className="catalog-explore-sheet">
            <div className="catalog-explore-header">
              <div>
                <span>Explorar catálogo</span>
                <h3>Encuentra el detalle ideal</h3>
              </div>

              <button type="button" onClick={() => setExploreOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="catalog-explore-group">
              <p>Temporadas</p>

              <div className="catalog-explore-list">
                {campaignItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      "catalog-explore-chip",
                      activeCampaign === item.id ? "active" : "",
                    ].join(" ")}
                    onClick={() =>
                      handleCampaignSelect(
                        activeCampaign === item.id ? "" : item.id,
                      )
                    }
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="catalog-explore-group">
              <p>Categorías emocionales</p>

              <div className="catalog-explore-list">
                {categoryItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      "catalog-explore-chip",
                      activeCategory === item.id ? "active" : "",
                    ].join(" ")}
                    onClick={() => handleCategorySelect(item.id)}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                    {categoryCounts[item.id] !== undefined && (
                      <small>({categoryCounts[item.id]})</small>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

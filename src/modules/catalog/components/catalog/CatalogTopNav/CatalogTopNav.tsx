import { useEffect, useRef, useState } from "react";
import { Menu, Sparkles, X } from "lucide-react";

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
  helpSlot,
}: CatalogTopNavProps) {
  const [exploreOpen, setExploreOpen] = useState(false);

  const exploreTrigger = useRef<HTMLButtonElement>(null);
  const campaignTrigger = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const exploreSheet = useRef<HTMLDivElement>(null);

  const hasCampaigns = campaignItems.length > 0;

  const activeCampaignItem = campaignItems.find(
    (item) => item.id === activeCampaign,
  );

  const openExplore = (trigger: HTMLButtonElement | null) => {
    lastTrigger.current = trigger;
    setExploreOpen(true);
  };

  const closeExplore = () => {
    setExploreOpen(false);
  };

  useEffect(() => {
    if (!exploreOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = lastTrigger.current;

    document.body.style.overflow = "hidden";

    exploreSheet.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus();

    const handleKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExploreOpen(false);
        return;
      }

      if (event.key !== "Tab") return;

      const buttons =
        exploreSheet.current?.querySelectorAll<HTMLButtonElement>("button");

      if (!buttons?.length) return;

      const first = buttons[0];
      const last = buttons[buttons.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }

      if (!event.shiftKey && document.activeElement === last) {
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

  const handleCategorySelect = (id: string) => {
    onCategorySelect?.(id);
    setExploreOpen(false);
  };

  const handleCampaignSelect = (id: string) => {
    onCampaignSelect?.(id);
    setExploreOpen(false);
  };

  const handleDiscoverSelect = (id: string) => {
    onDiscoverSelect?.(id);
    setExploreOpen(false);
  };

  const handleCampaignEntry = () => {
    if (campaignItems.length === 1) {
      const campaign = campaignItems[0];

      handleCampaignSelect(
        activeCampaign === campaign.id ? "" : campaign.id,
      );

      return;
    }

    openExplore(campaignTrigger.current);
  };

  const campaignLabel =
    campaignItems.length === 1
      ? `Campañas · ${campaignItems[0].name}`
      : activeCampaignItem
        ? `Campañas · ${activeCampaignItem.name}`
        : "Campañas";

  const campaignVisualLabel =
    campaignItems.length === 1
      ? campaignItems[0].name
      : activeCampaignItem?.name ?? "Campañas";

  return (
    <>
      <header className="catalog-top-nav">
        <div className="catalog-top-nav-inner">

          <div className="catalog-commerce-main">

            <h1 className="catalog-commerce-brand">
              {logoSlot}
            </h1>

            <div className="catalog-commerce-search">
              {searchSlot}
            </div>

            {helpSlot && (
              <div className="catalog-commerce-assist">
                {helpSlot}
              </div>
            )}

          </div>

          <div className="catalog-commerce-nav-row">

            <button
              ref={exploreTrigger}
              type="button"
              className="catalog-commerce-explore"
              aria-label="Explorar"
              aria-expanded={exploreOpen}
              aria-controls="catalog-explore-sheet"
              onClick={() => openExplore(exploreTrigger.current)}
            >
              <Menu size={17} aria-hidden="true" />
              <span>Explorar</span>
            </button>

            <nav
              className="catalog-commerce-categories"
              aria-label="Categorías"
            >
              {categoryItems.map((item) => {
                const isActive = activeCategory === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      "catalog-commerce-category",
                      isActive ? "active" : "",
                    ].join(" ")}
                    aria-pressed={isActive}
                    onClick={() =>
                      handleCategorySelect(item.id)
                    }
                  >
                    {item.name}
                  </button>
                );
              })}
            </nav>

            {hasCampaigns && (
              <button
                ref={campaignTrigger}
                type="button"
                className={[
                  "catalog-commerce-campaign",
                  activeCampaign ? "active" : "",
                ].join(" ")}
                aria-label={campaignLabel}
                aria-pressed={
                  campaignItems.length === 1
                    ? Boolean(activeCampaign)
                    : undefined
                }
                aria-expanded={
                  campaignItems.length > 1
                    ? exploreOpen
                    : undefined
                }
                aria-controls={
                  campaignItems.length > 1
                    ? "catalog-explore-sheet"
                    : undefined
                }
                onClick={handleCampaignEntry}
              >
                <Sparkles size={16} aria-hidden="true" />
                <span>{campaignVisualLabel}</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {exploreOpen && (
        <div className="catalog-explore-overlay">

          <button
            type="button"
            className="catalog-explore-backdrop"
            aria-label="Cerrar explorar"
            onClick={closeExplore}
          />

          <div
            ref={exploreSheet}
            id="catalog-explore-sheet"
            className="catalog-explore-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-explore-title"
          >

            <div className="catalog-explore-header">
              <div>
                <span>Explorar catálogo</span>

                <h3 id="catalog-explore-title">
                  Encuentra el detalle ideal
                </h3>
              </div>

              <button
                type="button"
                className="catalog-explore-close"
                aria-label="Cerrar explorar"
                onClick={closeExplore}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="catalog-explore-group">
              <p>Categorías emocionales</p>

              <div className="catalog-explore-list">
                {categoryItems.map((item) => {
                  const isActive =
                    activeCategory === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={[
                        "catalog-explore-chip",
                        isActive ? "active" : "",
                      ].join(" ")}
                      aria-pressed={isActive}
                      onClick={() =>
                        handleCategorySelect(item.id)
                      }
                    >
                      {item.icon && (
                        <span aria-hidden="true">
                          {item.icon}
                        </span>
                      )}

                      <span>{item.name}</span>

                      {categoryCounts[item.id] !== undefined && (
                        <small>
                          {categoryCounts[item.id]}
                        </small>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {discoverItems.length > 0 && (
              <div className="catalog-explore-group">
                <p>Descubre</p>

                <div
                  className="catalog-explore-list"
                  role="group"
                  aria-label="Descubre"
                >
                  <button
                    type="button"
                    className={[
                      "catalog-explore-chip",
                      !activeDiscover ? "active" : "",
                    ].join(" ")}
                    aria-pressed={!activeDiscover}
                    onClick={() =>
                      handleDiscoverSelect("")
                    }
                  >
                    Todos
                  </button>

                  {discoverItems.map((item) => {
                    const isActive =
                      activeDiscover === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={[
                          "catalog-explore-chip",
                          isActive ? "active" : "",
                        ].join(" ")}
                        aria-pressed={isActive}
                        onClick={() =>
                          handleDiscoverSelect(
                            isActive ? "" : item.id,
                          )
                        }
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasCampaigns && (
              <div className="catalog-explore-group">
                <p>Campañas activas</p>

                <div className="catalog-explore-list">
                  {campaignItems.map((item) => {
                    const isActive =
                      activeCampaign === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={[
                          "catalog-explore-chip",
                          "catalog-explore-campaign",
                          isActive ? "active" : "",
                        ].join(" ")}
                        aria-pressed={isActive}
                        onClick={() =>
                          handleCampaignSelect(
                            isActive ? "" : item.id,
                          )
                        }
                      >
                        {item.icon && (
                          <span aria-hidden="true">
                            {item.icon}
                          </span>
                        )}

                        <span>{item.name}</span>

                        {campaignCounts[item.id] !== undefined && (
                          <small>
                            {campaignCounts[item.id]}
                          </small>
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

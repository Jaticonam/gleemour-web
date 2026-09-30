import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { getExperienceUrl } from "@/app/routes/routes";
import { applyPageMetadata, catalogMetadata } from "@/seo/publicMetadata";

import {
  loadAllProducts,
  loadAllCampaigns,
} from "@/integrations/sheets/fetchSheets";
import type { Campaign, Product } from "@/shared/types/product";
import { isCampaignActive } from "@/integrations/sheets/normalizeCampaign";
import { BRAND_CONFIG } from "@/tenant/config/brand";
import { trackCommerceEvent } from "@/core/services/commerceEvents";


import { ProductCard } from "@/modules/catalog/components/product/ProductCard";
import { CatalogTopNav } from "@/modules/catalog/components/catalog/CatalogTopNav";
import { CatalogResultsToolbar } from "@/modules/catalog/components/catalog/CatalogResultsToolbar";
import { SearchInput } from "@/modules/catalog/components/search/SearchInput";

import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";

import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import {
  NotificationStack,
  showNotification,
} from "@/shared/components/feedback/NotificationStack";

import { CatalogSkeleton } from "@/shared/components/skeletons/CatalogSkeleton";
import {
  filterCatalogProducts,
  getAvailableSubcategories,
  getAvailableDiscoverOptions,
  normalizeCampaignKey,
  sortCatalogProducts,
  EMPTY_PURCHASE_FILTERS,
  type CatalogSort,
  type PurchaseFilters,
  type DiscoverKey,
} from "./CatalogFilters";

export default function CatalogPage() {
  useEffect(() => { applyPageMetadata(catalogMetadata); }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [brandLogoError, setBrandLogoError] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("todas");
  const [activeDiscover, setActiveDiscover] = useState<DiscoverKey | "">("");
  const [purchaseFilters, setPurchaseFilters] = useState<PurchaseFilters>({ ...EMPTY_PURCHASE_FILTERS });
  const [sort, setSort] = useState<CatalogSort>("featured");
  const viewed = useRef(false);
  const lastTrackedSearch = useRef("");



useEffect(() => {
    let mounted = true;

    Promise.allSettled([loadAllProducts(), loadAllCampaigns()])
      .then(([productsResult, campaignsResult]) => {
        if (!mounted) return;

        if (productsResult.status === "fulfilled") {
          setProducts(productsResult.value);
        } else {
          console.error("Error cargando productos:", productsResult.reason);
          setProducts([]);
          setLoadError(true);
        }

        if (campaignsResult.status === "fulfilled") {
          setCampaigns(campaignsResult.value);
        } else {
          console.warn(
            "Error cargando campañas. Se usarán campañas detectadas desde productos:",
            campaignsResult.reason,
          );
          setCampaigns([]);
        }
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc.todas = (acc.todas ?? 0) + 1;

      const productCategories = Array.isArray(product.categories)
        ? product.categories
        : [];

      const categoryIds = Array.from(
        new Set([product.category, ...productCategories].filter(Boolean)),
      );

      categoryIds.forEach((categoryId) => {
        acc[categoryId] = (acc[categoryId] ?? 0) + 1;
      });

      return acc;
    }, {});
  }, [products]);

  const discoverItems = useMemo(() => getAvailableDiscoverOptions(products), [products]);
  const subcategoryItems = useMemo(() => getAvailableSubcategories(products), [products]);

  const campaignCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      const productCampaigns = Array.isArray(product.campaigns)
        ? product.campaigns
        : [];

      productCampaigns.forEach((campaign: string) => {
        const campaignId = normalizeCampaignKey(campaign);

        if (!campaignId) return;

        acc[campaignId] = (acc[campaignId] ?? 0) + 1;
      });

      return acc;
    }, {});
  }, [products]);

  const visibleCampaigns = useMemo(() => {
    return campaigns
      .filter(isCampaignActive)
      .map((campaign) => {
        const possibleIds = [
          normalizeCampaignKey(campaign.id),
          normalizeCampaignKey(campaign.name),
        ].filter(Boolean);

        const countKey = possibleIds.find(
          (id) => (campaignCounts[id] ?? 0) > 0,
        );

        if (!countKey) return null;

        return {
          id: countKey,
          name: campaign.name,
          icon: campaign.icon || "✨",
          colorClass: campaign.colorClass || "catalog-campaign-gleemour",
          priority: campaign.priority ?? 0,
        };
      })
      .filter(
        (
          campaign,
        ): campaign is {
          id: string;
          name: string;
          icon: string;
          colorClass: string;
          priority: number;
        } => campaign !== null,
      )
      .sort((a, b) => b.priority - a.priority);
  }, [campaigns, campaignCounts]);

  const campaignParam = searchParams.get("campaign") ?? "";
  const activeCampaign = visibleCampaigns.find(
    (item) => item.id === normalizeCampaignKey(campaignParam),
  )?.id ?? "";

  useEffect(() => {
    if (!loading && campaignParam && !activeCampaign) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("campaign");
        return next;
      }, { replace: true });
    }
  }, [loading, campaignParam, activeCampaign, setSearchParams]);

  const handleCampaignSelect = (campaignId: string) => {
    const selected = visibleCampaigns.find((item) => item.id === campaignId);
    if (selected) trackCommerceEvent({
      type: "catalog_campaign_select", campaignId: selected.id, campaignName: selected.name,
    });
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (campaignId) next.set("campaign", campaignId);
      else next.delete("campaign");
      return next;
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    trackCommerceEvent({ type: "catalog_category_select", categoryId });
    setActiveCategory(categoryId);
  };

  const handleDiscoverSelect = (discoverId: DiscoverKey | "") => {
    if (discoverId) trackCommerceEvent({ type: "catalog_discover_select", discoverId });
    setActiveDiscover(discoverId);
  };

  const visibleProducts = useMemo(
    () => sortCatalogProducts(filterCatalogProducts(products, {
      searchQuery, activeCampaign, activeCategory, activeDiscover, purchase: purchaseFilters,
    }), sort),
    [products, searchQuery, activeCampaign, activeCategory, activeDiscover, purchaseFilters, sort],
  );

  useEffect(() => {
    if (loading || loadError || viewed.current) return;
    viewed.current = true;
    trackCommerceEvent({
      type: "catalog_view", categoryId: activeCategory,
      ...(activeCampaign ? { campaignId: activeCampaign } : {}),
      resultCount: visibleProducts.length,
    });
  }, [loading, loadError, activeCategory, activeCampaign, visibleProducts.length]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) { lastTrackedSearch.current = ""; return; }
    if (loading || loadError || query.length < 2 || query === lastTrackedSearch.current) return;
    const timeout = window.setTimeout(() => {
      lastTrackedSearch.current = query;
      trackCommerceEvent({
        type: "catalog_search", queryLength: query.length, resultCount: visibleProducts.length,
        categoryId: activeCategory, ...(activeCampaign ? { campaignId: activeCampaign } : {}),
      });
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [searchQuery, visibleProducts.length, loading, loadError, activeCategory, activeCampaign]);

  const resultTitle = searchQuery.trim()
    ? `Búsqueda: “${searchQuery.trim()}”`
    : visibleCampaigns.find((item) => item.id === activeCampaign)?.name
      ?? (activeCategory !== "todas"
        ? BRAND_CONFIG.categories.find((item) => item.id === activeCategory)?.name
        : undefined)
      ?? "Todos los detalles";

  const hasPurchaseFilters = purchaseFilters.minPrice !== "" ||
    purchaseFilters.maxPrice !== "" || purchaseFilters.availability !== "all" ||
    Boolean(purchaseFilters.subcategory);
  const emptyState = searchQuery.trim()
    ? { message: "No encontramos productos para tu búsqueda.", action: "Limpiar búsqueda" }
    : hasPurchaseFilters
      ? { message: "No encontramos productos con estos filtros.", action: "Limpiar filtros" }
      : { message: "No encontramos productos en esta selección.", action: "Ver todo el catálogo" };

  const resetEmptyState = () => {
    if (searchQuery.trim()) setSearchQuery("");
    else if (hasPurchaseFilters) {
      trackCommerceEvent({
        type: "catalog_filters_cleared", source: "empty_state",
        count: Number(purchaseFilters.minPrice !== "" || purchaseFilters.maxPrice !== "") +
          Number(purchaseFilters.availability !== "all") + Number(Boolean(purchaseFilters.subcategory)),
      });
      setPurchaseFilters({ ...EMPTY_PURCHASE_FILTERS });
    }
    else {
      setActiveCategory("todas");
      handleCampaignSelect("");
      setActiveDiscover("");
    }
  };


  if (loading) return <CatalogSkeleton />;

  return (
    <div className="catalog-page">
      <NotificationStack />

      <CatalogTopNav
        campaignItems={visibleCampaigns}
        categoryItems={BRAND_CONFIG.categories.filter(
          (item) => item.id === "todas" || (categoryCounts[item.id] ?? 0) > 0,
        )}
        activeCampaign={activeCampaign}
        activeCategory={activeCategory}
        activeDiscover={activeDiscover}
        discoverItems={discoverItems}
        campaignCounts={campaignCounts}
        categoryCounts={categoryCounts}
        onCampaignSelect={handleCampaignSelect}
        onCategorySelect={handleCategorySelect}
        onDiscoverSelect={handleDiscoverSelect}
        logoSlot={
          <button
            type="button"
            className="catalog-top-nav-brand"
            onClick={() => (window.location.href = "/")}
            aria-label={`Ir al inicio de ${BRAND_CONFIG.name}`}
          >
            {brandLogoError ? (
              <span className="catalog-top-nav-brand-wordmark">
                {BRAND_CONFIG.name}
              </span>
            ) : (
              <img
                src={BRAND_CONFIG.assets.logo}
                alt={BRAND_CONFIG.name}
                onError={() => setBrandLogoError(true)}
              />
            )}
          </button>
        }
        searchSlot={
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            products={products}
            placeholder="Buscar producto, ocasión o código"
          />
        }
        helpSlot={
          <Link
            to={getExperienceUrl("catalogo")}
            className="catalog-help-link"
            aria-label="Inspírame: descubre qué elegir"
            onClick={() => trackCommerceEvent({
              type: "catalog_help_choose", source: "catalog_header",
              categoryId: activeCategory, ...(activeCampaign ? { campaignId: activeCampaign } : {}),
              hasSearch: Boolean(searchQuery.trim()),
            })}
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Inspírame
          </Link>
        }
      />

      <main className="catalog-main">
        <CatalogResultsToolbar
          title={resultTitle}
          count={visibleProducts.length}
          filters={purchaseFilters}
          onFiltersChange={setPurchaseFilters}
          sort={sort}
          onSortChange={(next) => {
            if (next !== sort) trackCommerceEvent({
              type: "catalog_sort_changed", sortId: next, resultCount: visibleProducts.length,
            });
            setSort(next);
          }}
          subcategories={subcategoryItems}
        />
        {loadError ? (
          <div className="catalog-empty" role="alert">
            <p>No pudimos cargar los productos.</p>
            <small>Revisa tu conexión e inténtalo de nuevo.</small>
            <button type="button" className="catalog-empty-reset" onClick={() => window.location.reload()}>
              Reintentar
            </button>
          </div>
        ) : visibleProducts.length > 0 ? (
          <section
            className="catalog-section"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div
              className="catalog-grid"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="catalog-empty">
            <p>{emptyState.message}</p>
            <small>
              Prueba con otros criterios o vuelve al catálogo completo.
            </small>
            <button
              type="button"
              className="catalog-empty-reset"
              onClick={resetEmptyState}
            >
              {emptyState.action}
            </button>
          </div>
        )}
      </main>

      <FloatingButtons />

      <RecentActivity products={visibleProducts} />



    </div>
  );
}

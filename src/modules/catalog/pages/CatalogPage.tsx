import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

import { getExperienceUrl } from "@/app/routes/routes";

import {
  loadAllProducts,
  loadAllCampaigns,
} from "@/integrations/sheets/fetchSheets";
import type { Campaign, Product } from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";


import { ProductCard } from "@/modules/catalog/components/product/ProductCard";
import { CatalogTopNav } from "@/modules/catalog/components/catalog/CatalogTopNav";
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
  getAvailableDiscoverOptions,
  normalizeCampaignKey,
  normalizeFilterKey,
  type DiscoverKey,
} from "./CatalogFilters";

function isPublishedCampaignStatus(value: unknown): boolean {
  const status = normalizeFilterKey(value);

  return [
    "publicado",
    "publicada",
    "publicadas",
    "activo",
    "activa",
    "active",
    "published",
    "visible",
  ].includes(status);
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCampaign, setActiveCampaign] = useState("");
  const [activeCategory, setActiveCategory] = useState("todas");
  const [activeDiscover, setActiveDiscover] = useState<DiscoverKey | "">("");



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
      .filter((campaign) =>
        isPublishedCampaignStatus(campaign.publicationStatus),
      )
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

  console.table(
    campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      publicationStatus: campaign.publicationStatus,
      computedStatus: campaign.computedStatus,
      colorClass: campaign.colorClass,
      countById: campaignCounts[normalizeCampaignKey(campaign.id)] ?? 0,
      countByName: campaignCounts[normalizeCampaignKey(campaign.name)] ?? 0,
    })),
  );

  const handleCampaignSelect = (campaignId: string) => {
    setActiveCampaign(campaignId);
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const visibleProducts = useMemo(
    () => filterCatalogProducts(products, {
      searchQuery, activeCampaign, activeCategory, activeDiscover,
    }),
    [products, searchQuery, activeCampaign, activeCategory, activeDiscover],
  );


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
        onDiscoverSelect={setActiveDiscover}
        logoSlot={
          <button
            type="button"
            className="catalog-top-nav-brand"
            onClick={() => (window.location.href = "/")}
            aria-label={`Ir al inicio de ${BRAND_CONFIG.name}`}
          >
            <img src={BRAND_CONFIG.assets.logo} alt={BRAND_CONFIG.name} />
          </button>
        }
        headingSlot={
          <div className="catalog-heading">
            <p className="catalog-kicker">Catálogo emocional</p>
            <h1>Catálogo</h1>
            <p>Ramos, arreglos y detalles para cada momento especial.</p>
          </div>
        }
        searchSlot={
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            products={products}
            placeholder={BRAND_CONFIG.search.placeholder}
          />
        }
        helpSlot={
          <Link
            to={getExperienceUrl("catalogo")}
            className="catalog-help-link"
          >
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            Ayúdame a elegir
          </Link>
        }
      />

      <main className="catalog-main">
        {visibleProducts.length > 0 ? (
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
            <p>No encontramos productos con esta combinación.</p>
            <small>
              Prueba con otros criterios o vuelve al catálogo completo.
            </small>
            <button
              type="button"
              className="catalog-empty-reset"
              onClick={() => {
                setActiveCategory("todas");
                setActiveCampaign("");
                setActiveDiscover("");
                setSearchQuery("");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </main>

      <FloatingButtons />

      <RecentActivity products={visibleProducts} />



    </div>
  );
}

import { useEffect, useMemo, useState } from "react";

import {
  loadAllProducts,
  loadAllCampaigns,
} from "@/integrations/sheets/fetchSheets";
import type { Campaign, Product } from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";

import { useCart } from "@/modules/cart/hooks/useCart";
import { CartSidebar, AddToCartModal } from "@/modules/cart/components";

import { ProductCard } from "@/modules/catalog/components/product/ProductCard";
import { CatalogTopNav } from "@/modules/catalog/components/catalog/CatalogTopNav";
import { SearchInput } from "@/modules/catalog/components/search/SearchInput";
import { ImageZoomModal } from "@/modules/catalog/components/overlays/ImageZoomModal";
import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";

import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import {
  NotificationStack,
  showNotification,
} from "@/shared/components/feedback/NotificationStack";

import { CatalogSkeleton } from "@/shared/components/skeletons/CatalogSkeleton";

function normalizeFilterKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleFromSlug(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function productBelongsToCategory(product: Product, categoryId: string): boolean {
  if (categoryId === "todas") return true;

  const productCategories = Array.isArray(product.categories)
    ? product.categories
    : [];

  return product.category === categoryId || productCategories.includes(categoryId);
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCampaign, setActiveCampaign] = useState("");
  const [activeCategory, setActiveCategory] = useState("todas");

  const [cartOpen, setCartOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [zoomImage, setZoomImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const {
    cart,
    addToCart,
    removeFromCart,
    changeQty,
    setExactQty,
    setItemNote,
    totalItems,
    totalPrice,
    savings,
    clearCart,
  } = useCart();

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

  const campaignCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      const productCampaigns = Array.isArray((product as any).campaigns)
        ? (product as any).campaigns
        : [];

      productCampaigns.forEach((campaign: string) => {
        const campaignId = normalizeFilterKey(campaign);

        if (!campaignId) return;

        acc[campaignId] = (acc[campaignId] ?? 0) + 1;
      });

      return acc;
    }, {});
  }, [products]);

  const visibleCampaigns = useMemo(() => {
    const campaignById = new Map(
      campaigns.map((campaign) => [normalizeFilterKey(campaign.id), campaign]),
    );

    return Object.keys(campaignCounts)
      .map((campaignId) => {
        const sheetCampaign = campaignById.get(campaignId);

        return {
          id: campaignId,
          name: sheetCampaign?.name || titleFromSlug(campaignId),
          icon: sheetCampaign?.icon || "✨",
          colorClass: sheetCampaign?.colorClass || "catalog-campaign-purple",
          priority: sheetCampaign?.priority ?? 0,
        };
      })
      .sort((a, b) => b.priority - a.priority);
  }, [campaigns, campaignCounts]);

  const handleCampaignSelect = (campaignId: string) => {
    setActiveCampaign(campaignId);
    setActiveCategory("todas");
    setSearchQuery("");
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId);
    setActiveCampaign("");
    setSearchQuery("");
  };

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const normalizedActiveCampaign = normalizeFilterKey(activeCampaign);

    const byCampaign = !normalizedActiveCampaign
      ? products
      : products.filter((product) => {
          const productCampaigns = Array.isArray((product as any).campaigns)
            ? (product as any).campaigns
            : [];

          return productCampaigns
            .map(normalizeFilterKey)
            .includes(normalizedActiveCampaign);
        });

    const byCategory =
      activeCategory === "todas"
        ? byCampaign
        : byCampaign.filter((product) =>
            productBelongsToCategory(product, activeCategory),
          );

    if (!query) return byCategory;

    return byCategory.filter((product) => {
      const haystack = [
        product.id,
        product.title,
        product.description,
        product.category,
        product.occasion,
        product.message,
        product.highlight,
        ...(product.badges ?? []),
        ...((product as any).campaigns ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [products, searchQuery, activeCampaign, activeCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setSelectedProduct(product);
    setAddModalOpen(true);

    showNotification("Producto agregado", "Tu detalle fue agregado al pedido.");
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
        campaignCounts={campaignCounts}
        categoryCounts={categoryCounts}
        onCampaignSelect={handleCampaignSelect}
        onCategorySelect={handleCategorySelect}
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
        searchSlot={
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            products={products}
            placeholder={BRAND_CONFIG.search.placeholder}
          />
        }
      />

      <main className="catalog-main">
        <section className="catalog-hero" data-aos="fade-up">
          <p className="catalog-kicker">Catálogo emocional</p>
          <h1>Elige el detalle perfecto</h1>
          <p>Ramos, arreglos y detalles para cada momento especial.</p>
        </section>

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
                  cart={cart}
                  onAddToCart={handleAddToCart}
                  onImageClick={(src, title) =>
                    setZoomImage({
                      src,
                      title,
                    })
                  }
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="catalog-empty">
            <p>No encontramos detalles con esa búsqueda.</p>
            <small>
              Prueba con otra palabra o revisa el catálogo completo.
            </small>
          </div>
        )}
      </main>

      <FloatingButtons
        cartCount={totalItems}
        onCartClick={() => setCartOpen(true)}
      />

      <RecentActivity products={visibleProducts} />

      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        savings={savings}
        onRemove={removeFromCart}
        onChangeQty={changeQty}
        onSetQty={setExactQty}
        onChangeNote={setItemNote}
        onClearCart={clearCart}
      />

      <ImageZoomModal
        src={zoomImage?.src ?? null}
        title={zoomImage?.title ?? ""}
        onClose={() => setZoomImage(null)}
      />

      <AddToCartModal
        open={addModalOpen}
        product={selectedProduct}
        currentQty={
          selectedProduct
            ? (cart.find((item) => item.id === selectedProduct.id)?.qty ?? 0)
            : 0
        }
        onClose={() => setAddModalOpen(false)}
        onAddExtra={(qty) => {
          if (!selectedProduct) return;
          addToCart(selectedProduct, qty);
        }}
        onOpenCart={() => {
          setAddModalOpen(false);
          setCartOpen(true);
        }}
      />
    </div>
  );
}
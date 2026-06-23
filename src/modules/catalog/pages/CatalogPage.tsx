import { useEffect, useMemo, useState } from "react";

import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import { BRAND_CONFIG } from "@/tenant/config/brand";
import type { Product } from "@/shared/types/product";

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

const CAMPAIGN_ITEMS = [
  {
    id: "san-valentin",
    name: "San Valentín",
    icon: "💕",
    colorClass: "catalog-campaign-pink",
  },
  {
    id: "flores-amarillas",
    name: "Flores Amarillas",
    icon: "🌼",
    colorClass: "catalog-campaign-gold",
  },
  {
    id: "dia-madre",
    name: "Día de la Madre",
    icon: "🌷",
    colorClass: "catalog-campaign-purple",
  },
];

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
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

    loadAllProducts()
      .then((data) => {
        if (!mounted) return;
        setProducts(data);
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
      acc[product.category] = (acc[product.category] ?? 0) + 1;

      return acc;
    }, {});
  }, [products]);

  const campaignCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      const campaigns = Array.isArray((product as any).campaigns)
        ? (product as any).campaigns
        : [];

      campaigns.forEach((campaign: string) => {
        acc[campaign] = (acc[campaign] ?? 0) + 1;
      });

      return acc;
    }, {});
  }, [products]);

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const byCampaign = !activeCampaign
      ? products
      : products.filter((product) => {
          const campaigns = Array.isArray((product as any).campaigns)
            ? (product as any).campaigns
            : [];

          return campaigns.includes(activeCampaign);
        });

    const byCategory =
      activeCategory === "todas"
        ? byCampaign
        : byCampaign.filter((product) => product.category === activeCategory);

    if (!query) return byCategory;

    return byCategory.filter((product) => {
      const haystack = [
        product.id,
        product.title,
        product.description,
        product.category,
        ...(product.badges ?? []),
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
        campaignItems={CAMPAIGN_ITEMS.filter(
          (item) => (campaignCounts[item.id] ?? 0) > 0,
        )}
        categoryItems={BRAND_CONFIG.categories.filter(
          (item) => item.id === "todas" || (categoryCounts[item.id] ?? 0) > 0,
        )}
        activeCampaign={activeCampaign}
        activeCategory={activeCategory}
        campaignCounts={campaignCounts}
        categoryCounts={categoryCounts}
        onCampaignSelect={setActiveCampaign}
        onCategorySelect={setActiveCategory}
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

          <p>
            Ramos, arreglos y detalles creados para convertir momentos
            importantes en recuerdos memorables.
          </p>
        </section>

        {visibleProducts.length > 0 ? (
          <section
            className="catalog-section"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <div className="catalog-section-header">
              <div>
                <h2>Todo el catálogo</h2>
                <p>
                  {visibleProducts.length} detalle
                  {visibleProducts.length === 1 ? "" : "s"} disponible
                  {visibleProducts.length === 1 ? "" : "s"}.
                </p>
              </div>
            </div>

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

      <RecentActivity products={products} />

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

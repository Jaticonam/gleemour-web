import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchX } from "lucide-react";

import { useCart } from "@/modules/cart/hooks/useCart";
import { CartSidebar } from "@/modules/cart/components/CartSidebar";
import { AddToCartModal } from "@/modules/cart/components/AddToCartModal";

import { ProductCard } from "@/modules/catalog/components/ProductCard";
import { CategoryFilter } from "@/modules/catalog/components/CategoryFilter";
import { RecentActivity } from "@/modules/catalog/components/RecentActivity";
import { ImageZoomModal } from "@/modules/catalog/components/ImageZoomModal";

import { productBelongsToCategory } from "@/domain/product/categories";
import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import { searchProducts } from "@/shared/lib/search";
import { sortByCommercialPriority } from "@/shared/lib/sort";
import { Product } from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";

import { HeaderBar } from "@/shared/components/layout/HeaderBar";
import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import { CatalogSkeleton } from "@/shared/components/skeletons/CatalogSkeleton";

const TOP_PRIORITY = 100;
const STRONG_PRIORITY = 80;
const HIGHLIGHT_PRIORITY = 50;

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const navigate = useNavigate();

  const {
    cart,
    addToCart,
    totalItems,
    totalPrice,
    savings,
    removeFromCart,
    changeQty,
    setExactQty,
    setItemNote,
    clearCart,
  } = useCart();

  useEffect(() => {
    loadAllProducts().then((p) => {
      setProducts(p);
      setLoading(false);
    });
  }, []);

  const handleCategorySelect = useCallback((id: string) => {
    navigate(id === "todas" ? "/catalogo" : `/catalogo/categoria.html?cat=${encodeURIComponent(id)}`);
  }, [navigate]);

  const handleAddToCart = useCallback((p: Product) => {
    addToCart(p, 1);
    setSelectedProduct(p);
    setAddModalOpen(true);
  }, [addToCart]);

  const handleAddExtra = useCallback((qty: number) => {
    if (!selectedProduct || qty <= 0) return;
    addToCart(selectedProduct, qty);
  }, [addToCart, selectedProduct]);

  const currentQtyInCart = selectedProduct
    ? cart.find((item) => item.id === selectedProduct.id)?.qty ?? 0
    : 0;

  const filteredProducts = useMemo(() => {
    const term = searchQuery.trim();

    if (activeCategory === "todas") {
      return term ? searchProducts(products, term) : products;
    }

    const categoryProducts = products.filter((product) =>
      productBelongsToCategory(product, activeCategory)
    );

    return term
      ? searchProducts(categoryProducts, term).length
        ? searchProducts(categoryProducts, term)
        : searchProducts(products, term)
      : categoryProducts;
  }, [products, activeCategory, searchQuery]);

  const visibleCategories = useMemo(() => {
    return BRAND_CONFIG.categories.filter((category) => {
      if (category.id === "todas" || category.id === "all") return true;

      return products.some((product) =>
        productBelongsToCategory(product, category.id)
      );
    });
  }, [products]);

  const showPriorityBlocks = activeCategory === "todas" && !searchQuery.trim();

  const topProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];
    return sortByCommercialPriority(products.filter((p) => (p.priority || 0) >= TOP_PRIORITY));
  }, [products, showPriorityBlocks]);

  const strongProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];
    return sortByCommercialPriority(
      products.filter((p) => (p.priority || 0) >= STRONG_PRIORITY && (p.priority || 0) < TOP_PRIORITY)
    );
  }, [products, showPriorityBlocks]);

  const highlightProducts = useMemo(() => {
    if (!showPriorityBlocks) return [];
    return sortByCommercialPriority(
      products.filter((p) => (p.priority || 0) >= HIGHLIGHT_PRIORITY && (p.priority || 0) < STRONG_PRIORITY)
    );
  }, [products, showPriorityBlocks]);

  const regularProducts = useMemo(() => {
    const items = showPriorityBlocks
      ? filteredProducts.filter((p) => (p.priority || 0) < HIGHLIGHT_PRIORITY)
      : filteredProducts;

    return sortByCommercialPriority(items);
  }, [filteredProducts, showPriorityBlocks]);

  const renderGrid = (items: Product[]) => (
    <div className="catalog-grid">
      {items.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          cart={cart}
          onAddToCart={handleAddToCart}
          onImageClick={(src, title) => setZoomImage({ src, title })}
        />
      ))}
    </div>
  );

  if (loading) return <CatalogSkeleton />;

  return (
    <div className="catalog-page">
      <header className="catalog-sticky-header">
        <HeaderBar searchQuery={searchQuery} onSearchChange={setSearchQuery} products={products} />
      </header>

      <main className="catalog-main">
        <CategoryFilter categories={visibleCategories} active={activeCategory} onSelect={handleCategorySelect} />

        {filteredProducts.length === 0 ? (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">
              <SearchX className="w-10 h-10" />
            </div>
            <p>Sin resultados</p>
            <small>Prueba con otra palabra o elige una categoría emocional.</small>
          </div>
        ) : (
          <div className="catalog-sections">
            {showPriorityBlocks && topProducts.length > 0 && (
              <CatalogSection title="Favoritos para sorprender hoy" text="Detalles con mayor intención de compra. Bonitos, rápidos y sin drama logístico.">
                {renderGrid(topProducts)}
              </CatalogSection>
            )}

            {showPriorityBlocks && strongProducts.length > 0 && (
              <CatalogSection title="Recomendados por ocasión" text="Opciones pensadas para elegir rápido según el momento.">
                {renderGrid(strongProducts)}
              </CatalogSection>
            )}

            {showPriorityBlocks && highlightProducts.length > 0 && (
              <CatalogSection title="Ideas bonitas para regalar" text="Detalles con ese punto emocional que convierte un día normal en historia.">
                {renderGrid(highlightProducts)}
              </CatalogSection>
            )}

            {regularProducts.length > 0 && (
              <CatalogSection
                title={showPriorityBlocks ? "Todo el catálogo" : "Resultados"}
                text={showPriorityBlocks ? "Explora todos los detalles disponibles." : "Detalles encontrados según tu búsqueda."}
              >
                {renderGrid(regularProducts)}
              </CatalogSection>
            )}
          </div>
        )}
      </main>

      <FloatingButtons cartCount={totalItems} onCartClick={() => setCartOpen(true)} />
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

      <ImageZoomModal src={zoomImage?.src ?? null} title={zoomImage?.title ?? ""} onClose={() => setZoomImage(null)} />

      <AddToCartModal
        open={addModalOpen}
        product={selectedProduct}
        currentQty={currentQtyInCart}
        onClose={() => setAddModalOpen(false)}
        onAddExtra={handleAddExtra}
        onOpenCart={() => {
          setAddModalOpen(false);
          setCartOpen(true);
        }}
      />
    </div>
  );
}

function CatalogSection({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <section className="catalog-section">
      <div className="catalog-section-header">
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      {children}
    </section>
  );
}

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "@/modules/cart/hooks/useCart";
import { useCatalogProducts } from "@/modules/catalog/hooks";

import { CartSidebar, AddToCartModal } from "@/modules/cart/components";


import { CategoryFilter } from "@/modules/catalog/components/filters/CategoryFilter";
import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";
import { ImageZoomModal } from "@/modules/catalog/components/overlays/ImageZoomModal";

import type { Product } from "@/shared/types/product";

import { HeaderBar } from "@/shared/components/layout/HeaderBar";
import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import { CatalogSkeleton } from "@/shared/components/skeletons/CatalogSkeleton";

import {
  CatalogSection,
  CatalogEmptyState,
  CatalogProductGrid,
} from "@/modules/catalog/components/catalog";

export default function CatalogPage() {
  const [activeCategory] = useState("todas");
  const [searchQuery, setSearchQuery] = useState("");

  const [cartOpen, setCartOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [zoomImage, setZoomImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

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

  const {
    products,
    loading,
    filteredProducts,
    visibleCategories,
    showPriorityBlocks,
    topProducts,
    strongProducts,
    highlightProducts,
    regularProducts,
  } = useCatalogProducts(activeCategory, searchQuery);

  const handleCategorySelect = useCallback(
    (id: string) => {
      navigate(
        id === "todas"
          ? "/catalogo"
          : `/catalogo/categoria.html?cat=${encodeURIComponent(id)}`,
      );
    },
    [navigate],
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product, 1);
      setSelectedProduct(product);
      setAddModalOpen(true);
    },
    [addToCart],
  );

  const handleAddExtra = useCallback(
    (qty: number) => {
      if (!selectedProduct || qty <= 0) return;
      addToCart(selectedProduct, qty);
    },
    [addToCart, selectedProduct],
  );

  const currentQtyInCart = selectedProduct
    ? (cart.find((item) => item.id === selectedProduct.id)?.qty ?? 0)
    : 0;

  const renderGrid = (items: Product[]) => (
    <CatalogProductGrid
      products={items}
      cart={cart}
      onAddToCart={handleAddToCart}
      onImageClick={(src, title) => setZoomImage({ src, title })}
    />
  );

  if (loading) return <CatalogSkeleton />;

  return (
    <div className="catalog-page">
      <header className="catalog-sticky-header">
        <HeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          products={products}
        />
      </header>

      <main className="catalog-main">
        <CategoryFilter
          categories={visibleCategories}
          active={activeCategory}
          onSelect={handleCategorySelect}
        />

        {filteredProducts.length === 0 ? (
          <CatalogEmptyState />
        ) : (
          <div className="catalog-sections">
            {showPriorityBlocks && topProducts.length > 0 && (
              <CatalogSection
                title="Favoritos para sorprender hoy"
                text="Detalles con mayor intención de compra. Bonitos, rápidos y sin drama logístico."
              >
                {renderGrid(topProducts)}
              </CatalogSection>
            )}

            {showPriorityBlocks && strongProducts.length > 0 && (
              <CatalogSection
                title="Recomendados por ocasión"
                text="Opciones pensadas para elegir rápido según el momento."
              >
                {renderGrid(strongProducts)}
              </CatalogSection>
            )}

            {showPriorityBlocks && highlightProducts.length > 0 && (
              <CatalogSection
                title="Ideas bonitas para regalar"
                text="Detalles con ese punto emocional que convierte un día normal en historia."
              >
                {renderGrid(highlightProducts)}
              </CatalogSection>
            )}

            {regularProducts.length > 0 && (
              <CatalogSection
                title={showPriorityBlocks ? "Todo el catálogo" : "Resultados"}
                text={
                  showPriorityBlocks
                    ? "Explora todos los detalles disponibles."
                    : "Detalles encontrados según tu búsqueda."
                }
              >
                {renderGrid(regularProducts)}
              </CatalogSection>
            )}
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







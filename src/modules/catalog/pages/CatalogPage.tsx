import { useEffect, useMemo, useState } from "react";

import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import type { Product } from "@/shared/types/product";

import { useCart } from "@/modules/cart/hooks/useCart";
import { CartSidebar, AddToCartModal } from "@/modules/cart/components";

import { ProductCard } from "@/modules/catalog/components/product/ProductCard";
import { HeaderBar } from "@/shared/components/layout/HeaderBar";
import { ImageZoomModal } from "@/modules/catalog/components/overlays/ImageZoomModal";
import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";

import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import {
  NotificationStack,
  showNotification,
} from "@/shared/components/feedback/NotificationStack";

import { CatalogSkeleton } from "@/shared/components/skeletons/CatalogSkeleton";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
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

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
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
  }, [products, searchQuery]);

  const featuredProducts = useMemo(() => {
    return visibleProducts.slice(0, 12);
  }, [visibleProducts]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    setSelectedProduct(product);
    setAddModalOpen(true);

    showNotification(
      "Producto agregado",
      "Tu detalle fue agregado al pedido.",
    );
  };

  if (loading) return <CatalogSkeleton />;

  return (
    <div className="catalog-page">
      <NotificationStack />

      <div className="catalog-sticky-header">
        <HeaderBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          products={products}
        />
      </div>

      <main className="catalog-main">
        <section className="catalog-hero">
          <p className="catalog-kicker">Catálogo emocional</p>

          <h1>Elige el detalle perfecto</h1>

          <p>
            Ramos, arreglos y detalles creados para convertir momentos
            importantes en recuerdos memorables.
          </p>
        </section>

        {featuredProducts.length > 0 ? (
          <section className="catalog-sections">
            <div className="catalog-section">
              <div className="catalog-section-header">
                <h2>Detalles disponibles</h2>
                <p>
                  {featuredProducts.length} opciones listas para coordinar por
                  WhatsApp.
                </p>
              </div>

              <div className="catalog-grid">
                {featuredProducts.map((product) => (
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
            </div>
          </section>
        ) : (
          <div className="catalog-empty">
            <p>No encontramos detalles con esa búsqueda.</p>
            <small>Prueba con otra palabra o revisa el catálogo completo.</small>
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
            ? cart.find((item) => item.id === selectedProduct.id)?.qty ?? 0
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

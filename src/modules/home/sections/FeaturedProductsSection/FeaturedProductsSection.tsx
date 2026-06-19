import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, SearchX } from "lucide-react";

import { useCart } from "../../hooks/use-cart";
import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import { sortByCommercialPriority } from "../../lib/sort";
import { Product } from "../../types/product";

import { ProductCard } from "../ProductCard";
import { CartSidebar } from "../CartSidebar";
import { ImageZoomModal } from "../ImageZoomModal";
import { AddToCartModal } from "../AddToCartModal";
import { Flame } from "lucide-react";
import { HomeSectionHeader } from "../../components/HomeSectionHeader";

const HOME_MIN_PRIORITY = 80;
const HOME_LIMIT = 8;

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
    loadAllProducts()
      .then((items) => {
        setProducts(items);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const featuredProducts = useMemo(() => {
    return sortByCommercialPriority(
      products.filter((p) => (p.priority || 0) >= HOME_MIN_PRIORITY)
    ).slice(0, HOME_LIMIT);
  }, [products]);

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product, 1);
      setSelectedProduct(product);
      setAddModalOpen(true);
    },
    [addToCart]
  );

  const currentQtyInCart = selectedProduct
    ? cart.find((item) => item.id === selectedProduct.id)?.qty ?? 0
    : 0;

  const handleAddExtra = useCallback(
    (qty: number) => {
      if (!selectedProduct || qty <= 0) return;
      addToCart(selectedProduct, qty);
    },
    [addToCart, selectedProduct]
  );

  return (
    <section className="home-container pt-4 pb-10 md:pt-6 md:pb-4">
      <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <HomeSectionHeader
          icon={Flame}
          kicker="alta rotación"
          title="Productos que se venden solos"
          description="Elige lo que ya está funcionando y empieza a vender desde hoy."
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-[330px] animate-pulse rounded-2xl bg-slate-200 md:h-[420px]"
            />
          ))}
        </div>
      ) : featuredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 py-16 text-slate-500">
          <SearchX className="mb-3 h-8 w-8 opacity-40" />
          <p className="text-sm font-bold">
            aún no hay productos con priority 80 o 100
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cart={cart}
              onAddToCart={handleAddToCart}
              onImageClick={(src, title) => setZoomImage({ src, title })}
            />
          ))}
        </div>
      )}

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
    </section>
  );
}






import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getCatalogUrl, getCategoryUrl } from "@/app/routes/routes";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import { useCart } from "@/modules/cart/hooks/useCart";
import { CartSidebar } from "@/modules/cart/components";

import { ProductGallery } from "@/features/gallery";

import { ProductHeader } from "@/modules/catalog/components/product/ProductHeader";
import { ProductMeta } from "@/modules/catalog/components/product/ProductMeta";
import { ProductBuyBox } from "@/modules/catalog/components/product/ProductBuyBox";
import { ProductBenefits } from "@/modules/catalog/components/product/ProductBenefits";
import { ProductAddons } from "@/modules/catalog/components/product/ProductAddons";
import { ProductMusicLibrary } from "@/modules/catalog/components/product/ProductMusicLibrary";
import { ProductRelated } from "@/modules/catalog/components/product/ProductRelated";
import { ProductMobileBar } from "@/modules/catalog/components/product/ProductMobileBar";
import { ProductNotFound } from "@/modules/catalog/components/product/ProductNotFound";

import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";

import {
  useLiveViewers,
  useMusicLibrary,
  useProductActions,
  useProductAddonOptions,
  useProductAddons,
  useProductCart,
  useProductDetail,
  useProductQuantity,
} from "@/modules/catalog/hooks";

import { getProductStatusPresentation } from "@/modules/catalog/mappers";

import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import { NotificationStack } from "@/shared/components/feedback/NotificationStack";
import { ProductSkeleton } from "@/shared/components/skeletons/ProductSkeleton";

export default function ProductPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get("cat") || "";
  const productId = (searchParams.get("id") || paramId || "").trim();

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

  const {
    products,
    product,
    loading,
    notFound,
    relatedProducts,
    available,
    originalPrice,
    finalPrice,
    hasOffer,
    productState,
  } = useProductDetail({
    productId,
    relatedLimit: 4,
  });

  const viewers = useLiveViewers({
    min: 3,
    max: 18,
    interval: 7000,
  });

  const quantity = useProductQuantity({
    initialQty: 1,
    unitPrice: finalPrice,
  });
  const { resetQty } = quantity;

  const addonOptions = useProductAddonOptions(product?.addons ?? []);
  const productAddons = useProductAddons(addonOptions);
  const { clearAddons } = productAddons;

  const musicLibrary = useMusicLibrary();
  const [selectedMusicId, setSelectedMusicId] = useState("");

  const productCart = useProductCart({
    product,
    available,
    isQtyInputValid: quantity.isQtyInputValid,
    parsedQtyInput: quantity.parsedQtyInput,
    addToCart,
  });

  const productActions = useProductActions({
    product,
    qty: quantity.effectiveQty,
  });

  const { className: stockClass, Icon: StockIcon } =
    getProductStatusPresentation(productState);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    resetQty();
    clearAddons();
    setSelectedMusicId("");
  }, [productId, resetQty, clearAddons]);

  if (loading) return <ProductSkeleton />;

  if (notFound || !product) {
    return (
      <ProductNotFound
        onBack={() =>
          navigate(
            currentCategory ? getCategoryUrl(currentCategory) : getCatalogUrl(),
          )
        }
      />
    );
  }

  return (
    <div className="product-detail-page">
      <NotificationStack />

      <ProductHeader
        title={product.title}
        code={product.id}
        onBack={() => navigate(-1)}
        onShare={productActions.handleShare}
      />

      <main className="product-detail-main">
        <section className="product-detail-grid">
          <div className="product-detail-gallery">
            <ProductGallery product={product} available={available} />
          </div>

          <div className="product-detail-info">
            <div className="product-detail-purchase-panel">
              <ProductMeta
                product={product}
                available={available}
                viewers={viewers}
                productState={productState}
                stockClass={stockClass}
                StockIcon={StockIcon}
              />

              <ProductBuyBox
                finalPrice={finalPrice}
                originalPrice={originalPrice}
                hasOffer={hasOffer}
                quantity={quantity}
                available={available}
                onAddToCart={productCart.handleAddToCart}
                onWhatsApp={productActions.handleWhatsApp}
              />
            </div>
          </div>
        </section>

        <section className="product-detail-support">
          <ProductBenefits />

          <ProductAddons
            addons={productAddons.addons}
            selectedAddons={productAddons.selectedAddons}
            onToggleAddon={productAddons.toggleAddon}
          />

          <ProductMusicLibrary
            tracks={musicLibrary.tracks}
            selectedMusicId={selectedMusicId}
            loading={musicLibrary.loading}
            error={musicLibrary.error}
            onSelectMusic={setSelectedMusicId}
          />
        </section>

        <ProductRelated
          title={PRODUCT_DETAIL_CONFIG.related.title}
          description={PRODUCT_DETAIL_CONFIG.related.description}
          products={relatedProducts}
        />
      </main>

      <div className="product-detail-floating-actions">
        <FloatingButtons
          cartCount={totalItems}
          onCartClick={() => productCart.setCartOpen(true)}
        />
      </div>

      <div className="product-detail-recent-activity">
        <RecentActivity products={products} />
      </div>

      <ProductMobileBar
        total={quantity.total}
        cartCount={totalItems}
        onCartClick={() => productCart.setCartOpen(true)}
        onWhatsApp={productActions.handleWhatsApp}
      />

      <CartSidebar
        isOpen={productCart.cartOpen}
        onClose={() => productCart.setCartOpen(false)}
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


    </div>
  );
}

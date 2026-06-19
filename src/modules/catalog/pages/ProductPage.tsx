import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { getCatalogUrl, getCategoryUrl } from "@/app/routes/routes";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import { useCart } from "@/modules/cart/hooks/useCart";
import { AddToCartModal, CartSidebar } from "@/modules/cart/components";

import { ProductGallery } from "@/features/gallery";

import { ProductHeader } from "@/modules/catalog/components/product/ProductHeader";
import { ProductMeta } from "@/modules/catalog/components/product/ProductMeta";
import { ProductBuyBox } from "@/modules/catalog/components/product/ProductBuyBox";
import { ProductBenefits } from "@/modules/catalog/components/product/ProductBenefits";
import { ProductAddons } from "@/modules/catalog/components/product/ProductAddons";
import { ProductRelated } from "@/modules/catalog/components/product/ProductRelated";
import { ProductNotFound } from "@/modules/catalog/components/product/ProductNotFound";

import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";

import {
  useLiveViewers,
  useProductActions,
  useProductAddons,
  useProductCart,
  useProductDetail,
  useProductQuantity,
} from "@/modules/catalog/hooks";

import { getProductStatusPresentation } from "@/modules/catalog/mappers";

import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import {
  NotificationStack,
  showNotification,
} from "@/shared/components/feedback/NotificationStack";
import { ProductSkeleton } from "@/shared/components/skeletons/ProductSkeleton";

export default function ProductPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get("cat") || "";
  const productId = searchParams.get("id") || paramId;

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

  const productAddons = useProductAddons();

  const currentCartQty = useMemo(() => {
    if (!product) return 0;
    return cart.find((item) => item.id === product.id)?.qty ?? 0;
  }, [cart, product]);

  const productCart = useProductCart({
    product,
    available,
    isQtyInputValid: quantity.isQtyInputValid,
    parsedQtyInput: quantity.parsedQtyInput,
    currentCartQty,
    addToCart,
    setQty: quantity.setQty,
    setQtyInput: quantity.setQtyInput,
  });

  const productActions = useProductActions({
    product,
    qty: quantity.effectiveQty,
  });

  const { className: stockClass, Icon: StockIcon } =
    getProductStatusPresentation(productState);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    quantity.resetQty();
    productCart.resetProductCartState();
    productAddons.clearAddons();
  }, [productId]);

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

            <ProductBenefits />

            <ProductAddons
              addons={productAddons.addons}
              selectedAddons={productAddons.selectedAddons}
              onToggleAddon={productAddons.toggleAddon}
            />
          </div>
        </section>

        <ProductRelated
          title={PRODUCT_DETAIL_CONFIG.related.title}
          description={PRODUCT_DETAIL_CONFIG.related.description}
          products={relatedProducts}
          cart={cart}
          onAddToCart={(selected) => {
            addToCart(selected, 1);
            showNotification(
              PRODUCT_DETAIL_CONFIG.notifications.addedTitle,
              PRODUCT_DETAIL_CONFIG.notifications.addedDescription,
            );
          }}
          onImageClick={() => {}}
        />
      </main>

      <FloatingButtons
        cartCount={totalItems}
        onCartClick={() => productCart.setCartOpen(true)}
      />

      <RecentActivity products={products} />

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

      <AddToCartModal
        open={productCart.addModalOpen}
        product={product}
        currentQty={productCart.effectiveCartQty}
        onClose={productCart.closeAddModal}
        onAddExtra={productCart.handleAddExtraFromModal}
        onOpenCart={productCart.openCartFromModal}
      />
    </div>
  );
}

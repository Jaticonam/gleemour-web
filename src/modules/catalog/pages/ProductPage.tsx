import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Heart, MessageCircle, Minus, Plus, PlusCircle } from "lucide-react";

import { getCatalogUrl, getCategoryUrl } from "@/app/routes/routes";
import { getCategoryName } from "@/tenant/config/catalog";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import { useCart } from "@/modules/cart/hooks/useCart";
import { CartSidebar, AddToCartModal } from "@/modules/cart/components";

import {
  ProductAddons,
  ProductBenefits,
  ProductHeader,
  ProductNotFound,
  ProductRelated,
} from "@/modules/catalog/components/product";

import { ProductGallery } from "@/features/gallery";

import {
  useLiveViewers,
  useProductActions,
  useProductAddons,
  useProductCart,
  useProductDetail,
  useProductQuantity,
} from "@/modules/catalog/hooks";

import { getProductStatusPresentation } from "@/modules/catalog/mappers";
import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";

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
            <div className="product-detail-heading">
              <div className="product-detail-topline">
                <span className="product-detail-kicker">
                  {getCategoryName(product.category)}
                </span>

                <span className="product-detail-code">{product.id}</span>
              </div>

              <h2 className="product-detail-title">{product.title}</h2>

              <p className="product-detail-description">
                {product.description ||
                  PRODUCT_DETAIL_CONFIG.description.fallback}
              </p>
            </div>

            <div className="product-detail-meta-row">
              <div className={`product-detail-status ${stockClass}`}>
                <StockIcon className="w-4 h-4" />
                <span>{productState.label}</span>
              </div>

              {available && (
                <div className="product-detail-viewers">
                  <span />
                  {viewers} viendo ahora
                </div>
              )}
            </div>

            <div className="product-detail-buy-box">
              <div className="product-detail-price-box">
                <p>{PRODUCT_DETAIL_CONFIG.price.label}</p>

                <div className="product-detail-price">
                  <span>S/</span>
                  <strong>{finalPrice.toFixed(2)}</strong>
                </div>

                {hasOffer && <small>Antes S/ {originalPrice.toFixed(2)}</small>}
              </div>

              <div className="product-detail-qty-box">
                <p>{PRODUCT_DETAIL_CONFIG.quantity.label}</p>

                <div className="product-detail-qty-control">
                  <button
                    type="button"
                    onClick={() =>
                      quantity.updateQty(quantity.effectiveQty - 1)
                    }
                    disabled={quantity.effectiveQty <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    value={quantity.qtyInput}
                    onChange={(event) =>
                      quantity.handleQtyInputChange(event.target.value)
                    }
                    onBlur={quantity.handleQtyInputBlur}
                    onKeyDown={quantity.handleQtyInputKeyDown}
                    inputMode="numeric"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      quantity.updateQty(quantity.effectiveQty + 1)
                    }
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {!quantity.isQtyInputValid && (
                  <small className="product-detail-error">
                    Ingresa una cantidad válida.
                  </small>
                )}
              </div>

              <div className="product-detail-total">
                <span>Total estimado</span>
                <strong>S/ {quantity.total.toFixed(2)}</strong>
              </div>

              <div className="product-detail-actions">
                <button
                  type="button"
                  className="product-detail-primary-button"
                  onClick={productCart.handleAddToCart}
                  disabled={!available || !quantity.isQtyInputValid}
                >
                  <PlusCircle className="w-5 h-5" />
                  Agregar pedido
                </button>

                <button
                  type="button"
                  className="product-detail-whatsapp-button"
                  onClick={productActions.handleWhatsApp}
                >
                  <MessageCircle className="w-5 h-5" />
                  Consultar por WhatsApp
                </button>
              </div>

              <div className="product-detail-trust">
                <Heart className="w-4 h-4" />
                <span>{PRODUCT_DETAIL_CONFIG.trust.text}</span>
              </div>
            </div>

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

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { useCart } from "@/modules/cart/hooks/useCart";
import { useProductQuantity } from "@/modules/catalog/hooks";

import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";

import {
  getEffectivePrice,
  getOriginalProductPrice,
  getProductState,
  getRelatedProducts,
  getLiveViewers,
  hasOfferPrice,
  isProductAvailable,
} from "@/domain/product";

import { getCategoryName } from "@/tenant/config/categories";
import { getCatalogUrl, getCategoryUrl } from "@/app/routes/routes";

import type { Product } from "@/shared/types/product";

import { CartSidebar } from "@/modules/cart/components/CartSidebar";
import { AddToCartModal } from "@/modules/cart/components/AddToCartModal";
import { RecentActivity } from "@/modules/catalog/components/RecentActivity";
import { ImageZoomModal } from "@/modules/catalog/components/ImageZoomModal";

import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import {
  NotificationStack,
  showNotification,
} from "@/shared/components/feedback/NotificationStack";
import { ProductSkeleton } from "@/shared/components/skeletons/ProductSkeleton";

import { ProductGallery } from "@/features/gallery";

import {
  ProductHeader,
  ProductInfo,
  ProductBuyBox,
  ProductRelated,
} from "@/modules/catalog/components/product";

import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/productDetail";

export default function ProductPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get("cat") || "";
  const id = searchParams.get("id") || paramId;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [zoomImage, setZoomImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const [modalQty, setModalQty] = useState(0);
  const [viewers, setViewers] = useState(() => getLiveViewers());

  const {
    qty,
    qtyInput,
    parsedQtyInput,
    isQtyInputValid,
    effectiveQty,
    setQty,
    updateQty,
    resetQty,
    handleQtyInputChange,
    handleQtyInputBlur,
    handleQtyInputKeyDown,
  } = useProductQuantity(1);

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
    loadAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });

    const interval = setInterval(() => {
      setViewers(getLiveViewers());
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    resetQty();
    setModalQty(0);
    setAddModalOpen(false);
  }, [id, resetQty]);

  const product = useMemo(
    () => products.find((item) => item.id === id),
    [products, id]
  );

  const available = product ? isProductAvailable(product) : false;
  const originalPrice = product ? getOriginalProductPrice(product) : 0;
  const finalPrice = product ? getEffectivePrice(product) : 0;
  const hasOffer = product ? hasOfferPrice(product) : false;
  const total = finalPrice * effectiveQty;

  const productState = product
    ? getProductState(product)
    : {
        type: "unavailable",
        label: "No disponible",
        available: false,
      };

  const currentCartQty = useMemo(() => {
    if (!product) return 0;
    return cart.find((item) => item.id === product.id)?.qty ?? 0;
  }, [cart, product]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getRelatedProducts(product, products, 4);
  }, [product, products]);

  const handleAddToCart = useCallback(() => {
    if (!product || !available || !isQtyInputValid || parsedQtyInput === null) {
      return;
    }

    const nextQtyInCart = currentCartQty + parsedQtyInput;

    addToCart(product, parsedQtyInput);
    setModalQty(nextQtyInCart);
    setAddModalOpen(true);
  }, [
    product,
    available,
    isQtyInputValid,
    parsedQtyInput,
    currentCartQty,
    addToCart,
  ]);

  const handleAddExtraFromModal = useCallback(
    (extraQty: number) => {
      if (!product || extraQty <= 0) return;

      const nextQty = modalQty + extraQty;

      addToCart(product, extraQty);
      setModalQty(nextQty);
      setQty(nextQty);
    },
    [product, modalQty, addToCart, setQty]
  );

  const handleShare = useCallback(() => {
    if (!product) return;

    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
      return;
    }

    navigator.clipboard.writeText(window.location.href);
    showNotification(
      PRODUCT_DETAIL_CONFIG.notifications.linkCopiedTitle,
      PRODUCT_DETAIL_CONFIG.notifications.linkCopiedDescription
    );
  }, [product]);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;

    const url = buildProductWhatsAppUrl({
      product,
      qty: effectiveQty,
    });

    window.open(url, "_blank", "noopener,noreferrer");
  }, [product, effectiveQty]);

    let stockClass = "product-detail-status-muted";
  let StockIcon = Clock;

  switch (productState.type) {
    case "available":
      stockClass = "product-detail-status-success";
      StockIcon = CheckCircle;
      break;

    case "preorder":
      stockClass = "product-detail-status-preorder";
      StockIcon = Clock;
      break;

    case "sold-out":
      stockClass = "product-detail-status-danger";
      StockIcon = XCircle;
      break;

    case "last-units":
    case "limited":
      stockClass = "product-detail-status-warning";
      StockIcon = AlertTriangle;
      break;

    default:
      stockClass = "product-detail-status-muted";
      StockIcon = Clock;
  }

  if (loading) return <ProductSkeleton />;

  if (!product) {
    return (
      <div className="product-detail-empty">
        <p>{PRODUCT_DETAIL_CONFIG.empty.title}</p>

        <button
          onClick={() =>
            navigate(
              currentCategory
                ? getCategoryUrl(currentCategory)
                : getCatalogUrl()
            )
          }
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <NotificationStack />

      <ProductHeader
        title={product.title}
        code={product.id}
        onBack={() => navigate(-1)}
        onShare={handleShare}
      />

      <main className="product-detail-main">
        <section className="product-detail-grid">
          <ProductGallery
            product={product}
            available={available}
            onZoom={(src, title) =>
              setZoomImage({
                src,
                title,
              })
            }
          />

          <div className="product-detail-info">
            <ProductInfo
              product={product}
              categoryName={getCategoryName(product.category)}
              descriptionFallback={PRODUCT_DETAIL_CONFIG.description.fallback}
              stockClass={stockClass}
              StockIcon={StockIcon}
              stockLabel={productState.label}
              available={available}
              viewers={viewers}
            />

            <ProductBuyBox
              priceLabel={PRODUCT_DETAIL_CONFIG.price.label}
              quantityLabel={PRODUCT_DETAIL_CONFIG.quantity.label}
              finalPrice={finalPrice}
              originalPrice={originalPrice}
              hasOffer={hasOffer}
              qtyInput={qtyInput}
              effectiveQty={effectiveQty}
              total={total}
              isQtyInputValid={isQtyInputValid}
              available={available}
              trustText={PRODUCT_DETAIL_CONFIG.trust.text}
              onDecreaseQty={() => updateQty(effectiveQty - 1)}
              onIncreaseQty={() => updateQty(effectiveQty + 1)}
              onQtyInputChange={handleQtyInputChange}
              onQtyInputBlur={handleQtyInputBlur}
              onQtyInputKeyDown={handleQtyInputKeyDown}
              onAddToCart={handleAddToCart}
              onWhatsApp={handleWhatsApp}
            />
          </div>
        </section>
                {relatedProducts.length > 0 && (
          <ProductRelated
            title={PRODUCT_DETAIL_CONFIG.related.title}
            products={relatedProducts}
            currentCategory={currentCategory}
          />
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
        product={product}
        currentQty={modalQty || currentCartQty}
        onClose={() => setAddModalOpen(false)}
        onAddExtra={handleAddExtraFromModal}
        onOpenCart={() => {
          setAddModalOpen(false);
          setCartOpen(true);
        }}
      />
    </div>
  );
}

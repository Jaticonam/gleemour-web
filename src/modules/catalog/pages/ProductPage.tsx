import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Heart,
  MessageCircle,
  Minus,
  Plus,
  PlusCircle,
  Share2,
  XCircle,
  ZoomIn,
} from "lucide-react";

import { useCart } from "@/modules/cart/hooks/useCart";
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
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import { RecentActivity } from "@/modules/catalog/components/RecentActivity";
import { ImageZoomModal } from "@/modules/catalog/components/ImageZoomModal";
import { CountdownTimer } from "@/modules/catalog/components/CountdownBanner";

import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import {
  NotificationStack,
  showNotification,
} from "@/shared/components/feedback/NotificationStack";
import { ProductSkeleton } from "@/shared/components/skeletons/ProductSkeleton";

import { getBadgePresentation, sortBadges } from "@/tenant/config/badgeRules";
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
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);

  const [qty, setQty] = useState(1);
  const [qtyInput, setQtyInput] = useState("1");
  const [modalQty, setModalQty] = useState(0);
  const [viewers, setViewers] = useState(() => getLiveViewers());

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
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setQty(1);
    setQtyInput("1");
    setModalQty(0);
    setAddModalOpen(false);
  }, [id]);

  const product = useMemo(
    () => products.find((item) => item.id === id),
    [products, id]
  );

  const available = product ? isProductAvailable(product) : false;
  const originalPrice = product ? getOriginalProductPrice(product) : 0;
  const finalPrice = product ? getEffectivePrice(product) : 0;
  const hasOffer = product ? hasOfferPrice(product) : false;

  const productState = product
    ? getProductState(product)
    : { type: "unavailable", label: "No disponible", available: false };

  const currentCartQty = useMemo(() => {
    if (!product) return 0;
    return cart.find((item) => item.id === product.id)?.qty ?? 0;
  }, [cart, product]);

  const parsedQtyInput =
    qtyInput.trim() !== "" && /^\d+$/.test(qtyInput)
      ? parseInt(qtyInput, 10)
      : null;

  const isQtyInputValid = parsedQtyInput !== null && parsedQtyInput >= 1;
  const effectiveQty = isQtyInputValid ? parsedQtyInput : qty;
  const total = finalPrice * effectiveQty;

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return getRelatedProducts(product, products, 4);
  }, [product, products]);

  const productBadges = useMemo(() => {
    if (!product) return [];
    return product.badges ?? [];
  }, [product]);

  const updateQty = useCallback((newQty: number) => {
    const safeQty = Math.max(1, Math.floor(newQty));
    setQty(safeQty);
    setQtyInput(String(safeQty));
  }, []);

  const handleQtyInputChange = useCallback((value: string) => {
    if (value === "") {
      setQtyInput("");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setQtyInput(value);

    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed >= 1) setQty(parsed);
  }, []);

  const handleQtyInputBlur = useCallback(() => {
    const parsed = parseInt(qtyInput, 10);

    if (isNaN(parsed) || parsed < 1) {
      updateQty(1);
      return;
    }

    updateQty(parsed);
  }, [qtyInput, updateQty]);

  const handleQtyInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") e.currentTarget.blur();

      if (e.key === "ArrowUp") {
        e.preventDefault();
        updateQty(effectiveQty + 1);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        updateQty(Math.max(1, effectiveQty - 1));
      }
    },
    [effectiveQty, updateQty]
  );

  const handleAddToCart = useCallback(() => {
    if (!product || !available || !isQtyInputValid || parsedQtyInput === null) return;

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
      setQtyInput(String(nextQty));
    },
    [product, modalQty, addToCart]
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

      <header className="product-detail-header">
        {/* <CountdownTimer /> */}

        <div className="product-detail-header-inner">
          <button
            onClick={() => navigate(-1)}
            className="product-detail-icon-button"
            aria-label="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="product-detail-header-title">
            <h1>{product.title}</h1>
            <p>{product.id}</p>
          </div>

          <button
            onClick={handleShare}
            className="product-detail-icon-button"
            aria-label="Compartir"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="product-detail-main">
        <section className="product-detail-grid">
          <div className="product-detail-gallery">
            <div
              className="product-detail-image-wrap"
              onClick={() =>
                setZoomImage({
                  src: product.img,
                  title: product.title,
                })
              }
            >
              <img
                src={product.img}
                alt={product.title}
                className={`product-detail-image ${
                  !available ? "product-detail-image-disabled" : ""
                }`}
              />

              {productBadges.length > 0 && (
                <div className="product-detail-badges">
                  {sortBadges(productBadges)
                    .slice(0, 3)
                    .map((badge, index) => {
                      const presentation = getBadgePresentation(badge);

                      return (
                        <span
                          key={`${product.id}-badge-${index}`}
                          className={[
                            "product-detail-badge",
                            presentation.className,
                            presentation.animation,
                          ].join(" ")}
                        >
                          {badge}
                        </span>
                      );
                    })}
                </div>
              )}

              <div className="product-detail-zoom">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="product-detail-info">
            <div className="product-detail-heading">
              <div className="product-detail-topline">
                <span className="product-detail-kicker">
                  {getCategoryName(product.category)}
                </span>

                <span className="product-detail-code">
                  {product.id}
                </span>
              </div>

              <h2 className="product-detail-title">
                {product.title}
              </h2>

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

                {hasOffer && (
                  <small>
                    Antes S/ {originalPrice.toFixed(2)}
                  </small>
                )}
              </div>

              <div className="product-detail-qty-box">
                <p>{PRODUCT_DETAIL_CONFIG.quantity.label}</p>

                <div className="product-detail-qty-control">
                  <button
                    onClick={() => updateQty(effectiveQty - 1)}
                    disabled={effectiveQty <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    value={qtyInput}
                    onChange={(e) => handleQtyInputChange(e.target.value)}
                    onBlur={handleQtyInputBlur}
                    onKeyDown={handleQtyInputKeyDown}
                    inputMode="numeric"
                  />

                  <button
                    onClick={() => updateQty(effectiveQty + 1)}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {!isQtyInputValid && (
                  <small className="product-detail-error">
                    Ingresa una cantidad válida.
                  </small>
                )}
              </div>

              <div className="product-detail-total">
                <span>Total estimado</span>
                <strong>S/ {total.toFixed(2)}</strong>
              </div>

              <div className="product-detail-actions">
                <button
                  className="product-detail-primary-button"
                  onClick={handleAddToCart}
                  disabled={!available || !isQtyInputValid}
                >
                  <PlusCircle className="w-5 h-5" />
                  Agregar pedido
                </button>

                <button
                  className="product-detail-whatsapp-button"
                  onClick={handleWhatsApp}
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
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="product-detail-related">
            <div className="product-detail-section-header">
              <h2>{PRODUCT_DETAIL_CONFIG.related.title}</h2>
              <p>{PRODUCT_DETAIL_CONFIG.related.description}</p>
            </div>

            <div className="catalog-grid">
              {relatedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  cart={cart}
                  onAddToCart={(selected) => {
                    addToCart(selected, 1);
                    showNotification(
                      PRODUCT_DETAIL_CONFIG.notifications.addedTitle,
                      PRODUCT_DETAIL_CONFIG.notifications.addedDescription
                    );
                  }}
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




import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  getCatalogUrl,
  getCategoryUrl,
  getExperienceUrl,
} from "@/app/routes/routes";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

import { ProductGallery } from "@/features/gallery";

import { ProductHeader } from "@/modules/catalog/components/product/ProductHeader";
import { ProductMeta } from "@/modules/catalog/components/product/ProductMeta";
import { ProductBenefits } from "@/modules/catalog/components/product/ProductBenefits";
import { ProductAddons } from "@/modules/catalog/components/product/ProductAddons";
import { ProductMusicLibrary } from "@/modules/catalog/components/product/ProductMusicLibrary";
import { ProductRelated } from "@/modules/catalog/components/product/ProductRelated";
import { ProductMobileBar } from "@/modules/catalog/components/product/ProductMobileBar";
import { ProductNotFound } from "@/modules/catalog/components/product/ProductNotFound";
import { ProductIntentionNav } from "@/modules/catalog/components/product/ProductIntentionNav";
import { ProductQuantityControl } from "@/modules/catalog/components/product/ProductQuantityControl";
import { ProductDedication } from "@/modules/catalog/components/product/ProductDedication";
import { ProductOrderSummary } from "@/modules/catalog/components/product/ProductOrderSummary";

import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";

import {
  useLiveViewers,
  useMusicLibrary,
  useProductActions,
  useProductAddonOptions,
  useProductAddons,
  useProductConfiguration,
  useProductDetail,
  useProductQuantity,
} from "@/modules/catalog/hooks";

import { getProductStatusPresentation } from "@/modules/catalog/mappers";

import { NotificationStack } from "@/shared/components/feedback/NotificationStack";
import { ProductSkeleton } from "@/shared/components/skeletons/ProductSkeleton";

export default function ProductPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get("cat") || "";
  const productId = (searchParams.get("id") || paramId || "").trim();


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

  const musicLibrary = useMusicLibrary(product?.music ?? []);
  const [selectedMusicId, setSelectedMusicId] = useState("");
  const [dedication, setDedication] = useState("");

  const productConfiguration = useProductConfiguration({
    unitPrice: finalPrice,
    quantity: quantity.effectiveQty,
    selectedAddons: productAddons.selectedAddons,
    addonsTotal: productAddons.addonsTotal,
    tracks: musicLibrary.tracks,
    selectedMusicId,
    dedication,
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
    setDedication("");
  }, [productId, resetQty, clearAddons]);

  if (loading) return <ProductSkeleton />;

  if (notFound || !product) {
    return (
      <ProductNotFound
        onBack={() =>
          navigate(
            currentCategory
              ? getCategoryUrl(currentCategory)
              : getCatalogUrl(),
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
        <section className="product-detail-experience">
          <ProductIntentionNav
            activeCategory={product.category}
            onSelect={(categoryId) =>
              navigate(getCategoryUrl(categoryId))
            }
          />

          <section
            className="product-detail-configurator"
            aria-label="Producto y personalización"
          >
            <div className="product-detail-gallery">
              <ProductGallery product={product} available={available} />
            </div>

            <div className="product-detail-overview">
              <ProductMeta
                product={product}
                available={available}
                viewers={viewers}
                productState={productState}
                stockClass={stockClass}
                StockIcon={StockIcon}
              />

              <ProductQuantityControl
                quantity={quantity}
                unitPrice={finalPrice}
              />
            </div>

            <ProductAddons
              addons={productAddons.addons}
              selectedAddons={productAddons.selectedAddons}
              onToggleAddon={productAddons.toggleAddon}
            />

            {musicLibrary.loading ||
            musicLibrary.error ||
            musicLibrary.tracks.length > 0 ? (
              <ProductMusicLibrary
                tracks={musicLibrary.tracks}
                selectedMusicId={selectedMusicId}
                loading={musicLibrary.loading}
                error={musicLibrary.error}
                onSelectMusic={setSelectedMusicId}
              />
            ) : null}

            <ProductDedication
              value={dedication}
              onChange={setDedication}
            />
          </section>

          <aside
            className="product-detail-summary"
            aria-label="Resumen de la configuración"
          >
            <ProductOrderSummary
              productTitle={product.title}
              unitPrice={finalPrice}
              originalPrice={originalPrice}
              hasOffer={hasOffer}
              configuration={productConfiguration}
              onPersonalize={() =>
                navigate(getExperienceUrl("producto", product.id))
              }
              onWhatsApp={productActions.handleWhatsApp}
            />
          </aside>
        </section>

        <section className="product-detail-support">
          <ProductBenefits />
        </section>

        <ProductRelated
          title={PRODUCT_DETAIL_CONFIG.related.title}
          description={PRODUCT_DETAIL_CONFIG.related.description}
          products={relatedProducts}
        />
      </main>


      <div className="product-detail-recent-activity">
        <RecentActivity products={products} />
      </div>

      <ProductMobileBar
        total={productConfiguration.configuredTotal}
        onPersonalize={() =>
          navigate(getExperienceUrl("producto", product.id))
        }
        onWhatsApp={productActions.handleWhatsApp}
      />

    </div>
  );
}
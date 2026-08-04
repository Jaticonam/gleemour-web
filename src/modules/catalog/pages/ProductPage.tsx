import { useEffect } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  getCatalogUrl,
  getCategoryUrl,
  getExperienceUrl,
} from "@/app/routes/routes";
import { ProductGallery } from "@/features/gallery";
import { ProductBenefits } from "@/modules/catalog/components/product/ProductBenefits";
import { ProductHeader } from "@/modules/catalog/components/product/ProductHeader";
import { ProductIntentionNav } from "@/modules/catalog/components/product/ProductIntentionNav";
import { ProductMeta } from "@/modules/catalog/components/product/ProductMeta";
import { ProductMobileBar } from "@/modules/catalog/components/product/ProductMobileBar";
import { ProductNotFound } from "@/modules/catalog/components/product/ProductNotFound";
import { ProductProfileActions } from "@/modules/catalog/components/product/ProductProfileActions";
import { ProductRelated } from "@/modules/catalog/components/product/ProductRelated";
import { RecentActivity } from "@/modules/catalog/components/overlays/RecentActivity";
import {
  useLiveViewers,
  useProductActions,
  useProductDetail,
} from "@/modules/catalog/hooks";
import { getProductStatusPresentation } from "@/modules/catalog/mappers";
import { NotificationStack } from "@/shared/components/feedback/NotificationStack";
import { ProductSkeleton } from "@/shared/components/skeletons/ProductSkeleton";
import { PRODUCT_DETAIL_CONFIG } from "@/tenant/config/product";

export default function ProductPage() {
  const { id: paramId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentCategory = searchParams.get("cat") || "";
  const productId = (
    searchParams.get("id") ||
    paramId ||
    ""
  ).trim();

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

  const productActions = useProductActions({
    product,
    qty: 1,
  });

  const {
    className: stockClass,
    Icon: StockIcon,
  } = getProductStatusPresentation(productState);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [productId]);

  if (loading) {
    return <ProductSkeleton />;
  }

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

  const openExperience = () => {
    navigate(
      getExperienceUrl(
        "producto",
        product.id,
      ),
    );
  };

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
            aria-label="Información del producto"
          >
            <div className="product-detail-gallery">
              <ProductGallery
                product={product}
                available={available}
              />
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
            </div>
          </section>

          <aside
            className="product-detail-summary"
            aria-label="Acciones del producto"
          >
            <ProductProfileActions
              productTitle={product.title}
              finalPrice={finalPrice}
              originalPrice={originalPrice}
              hasOffer={hasOffer}
              onPersonalize={openExperience}
              onWhatsApp={productActions.handleWhatsApp}
            />
          </aside>
        </section>

        <section className="product-detail-support">
          <ProductBenefits />
        </section>

        <ProductRelated
          title={PRODUCT_DETAIL_CONFIG.related.title}
          products={relatedProducts}
        />
      </main>

      <div className="product-detail-recent-activity">
        <RecentActivity products={products} />
      </div>

      <ProductMobileBar
        price={finalPrice}
        onPersonalize={openExperience}
        onWhatsApp={productActions.handleWhatsApp}
      />
    </div>
  );
}
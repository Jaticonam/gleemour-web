import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";

import { BRAND_CONFIG } from "@/tenant/config/brand";
import { useCart } from "@/modules/cart/hooks/useCart";
import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import { productBelongsToCategory } from "@/domain/product/categories";
import { searchProducts } from "@/shared/lib/search";
import { sortByCommercialPriority } from "@/shared/lib/sort";
import { Product } from "@/shared/types/product";

import { CountdownTimer } from "@/modules/catalog/components/CountdownBanner";
import { CategoryFilter } from "@/modules/catalog/components/CategoryFilter";
import { ProductCard } from "@/modules/catalog/components/ProductCard";
import { CartSidebar } from "@/modules/cart/components/CartSidebar";
import { FloatingButtons } from "@/shared/components/overlays/FloatingButtons";
import { RecentActivity } from "@/modules/catalog/components/RecentActivity";
import { ImageZoomModal } from "@/modules/catalog/components/ImageZoomModal";
import { AddToCartModal } from "@/modules/cart/components/AddToCartModal";
import { CategorySkeleton } from "@/shared/components/skeletons/CategorySkeleton";
import { SearchInput } from "@/modules/catalog/components/SearchInput";

const CategoryPage = () => {
  const { id: paramCategoryId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("cat") || paramCategoryId;
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<{ src: string; title: string } | null>(null);
  const [categorySearch, setCategorySearch] = useState("");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
  } = useCart();

  useEffect(() => {
    loadAllProducts().then((loadedProducts) => {
      setProducts(loadedProducts);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (categoryId === "todas") {
      navigate("/catalogo", { replace: true });
    }
  }, [categoryId, navigate]);

  useEffect(() => {
    setCategorySearch("");
  }, [categoryId]);

  const activeCategory = categoryId || "todas";

  const categoryInfo = BRAND_CONFIG.categories.find(
    (category) => category.id === activeCategory
  );

  const visibleCategories = useMemo(() => {
    return BRAND_CONFIG.categories.filter((category) => {
      if (category.id === "todas") return true;

      return products.some((product) =>
        productBelongsToCategory(product, category.id)
      );
    });
  }, [products]);

  const categoryProducts = useMemo(() => {
    return products.filter((product) =>
      productBelongsToCategory(product, activeCategory)
    );
  }, [products, activeCategory]);

  const filteredProducts = useMemo(() => {
    const term = categorySearch.trim();

    if (!term) {
      return sortByCommercialPriority(categoryProducts);
    }

    const insideCategory = searchProducts(categoryProducts, term);

    if (insideCategory.length > 0) {
      return sortByCommercialPriority(insideCategory);
    }

    return sortByCommercialPriority(searchProducts(products, term));
  }, [categoryProducts, products, categorySearch]);

  const handleCategorySelect = useCallback(
    (id: string) => {
      if (id === "todas") {
        navigate("/catalogo");
      } else {
        navigate(`/catalogo/categoria.html?cat=${encodeURIComponent(id)}`);
      }
    },
    [navigate]
  );

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product, 1);
      setSelectedProduct(product);
      setAddModalOpen(true);
    },
    [addToCart]
  );

  const handleCloseAddModal = useCallback(() => {
    setAddModalOpen(false);
  }, []);

  const handleAddExtra = useCallback(
    (qty: number) => {
      if (!selectedProduct || qty <= 0) return;
      addToCart(selectedProduct, qty);
    },
    [addToCart, selectedProduct]
  );

  const currentQtyInCart = selectedProduct
    ? cart.find((item) => item.id === selectedProduct.id)?.qty ?? 0
    : 0;

  const hasSearch = categorySearch.trim().length > 0;

  return (
    <div className="category-page">
      <header className="category-page-header">
        {/* <CountdownTimer /> */}

        <div className="category-page-header-inner">
          <div className="category-page-header-row">
            <div className="category-page-title-wrap">
              <button
                type="button"
                onClick={() => navigate("/catalogo")}
                className="category-page-back"
                aria-label="Volver al catálogo"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                <h1>
                  {categoryInfo
                    ? `${categoryInfo.icon} ${categoryInfo.name}`
                    : "Explorar detalles"}
                </h1>

                <p>
                  {categoryInfo?.description ||
                    "Encuentra el detalle ideal para sorprender."}
                </p>

                <span>
                  {hasSearch
                    ? `${filteredProducts.length} resultado${
                        filteredProducts.length === 1 ? "" : "s"
                      }`
                    : `${categoryProducts.length} detalle${
                        categoryProducts.length === 1 ? "" : "s"
                      }`}
                </span>
              </div>
            </div>

            <div className="category-page-search">
              <SearchInput
                value={categorySearch}
                onChange={setCategorySearch}
                products={categoryProducts}
                placeholder={`Buscar en ${
                  categoryInfo?.name ?? "la categoría"
                }...`}
              />

              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setCategorySearch("")}
                  aria-label="Limpiar búsqueda"
                >
                  <SearchX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="category-page-main">
        <CategoryFilter
          categories={visibleCategories}
          active={activeCategory}
          onSelect={handleCategorySelect}
        />

        {loading ? (
          <CategorySkeleton />
        ) : filteredProducts.length === 0 ? (
          <div className="category-page-empty">
            <div>
              <SearchX className="w-10 h-10" />
            </div>

            <p>
              {hasSearch
                ? "Ups… no encontramos algo así aquí"
                : "Aún no hay detalles en esta categoría"}
            </p>

            <small>Prueba con otra categoría o explora todo el catálogo.</small>

            {hasSearch && (
              <button type="button" onClick={() => setCategorySearch("")}>
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="category-page-grid">
            {filteredProducts.map((product) => (
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
        onClose={handleCloseAddModal}
        onAddExtra={handleAddExtra}
        onOpenCart={() => {
          setAddModalOpen(false);
          setCartOpen(true);
        }}
      />
    </div>
  );
};

export default CategoryPage;

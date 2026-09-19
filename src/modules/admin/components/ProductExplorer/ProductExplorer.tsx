import "./ProductExplorer.css";
import "./ProductExplorer.products.css";
import "./ProductExplorer.responsive.css";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  Boxes,
  Loader2,
  PackageCheck,
  PackageX,
  FileText,
  RefreshCw,
  Search,
} from "lucide-react";

import { loadAllProductsForAdmin } from "@/integrations/sheets/fetchSheets";
import type { Product } from "@/shared/types/product";
import { CATEGORIES } from "@/tenant/config/catalog";

import { AdminProductRow } from "./AdminProductRow";
import {
  ALL_ADMIN_FILTERS,
  filterAdminProducts,
  getProductExplorerStats,
} from "./ProductExplorer.utils";

const STATUS_ORDER = [
  "Publicado",
  "Preventa",
  "Agotado",
  "Oculto",
  "Borrador",
];

interface ProductExplorerProps {
  loadProducts?: () => Promise<Product[]>;
  selectedProductIds?: readonly string[];
  onSelectedProductIdsChange?: (productIds: string[]) => void;
  onPrepareCatalog?: () => void;
}

function getStatusOptions(products: readonly Product[]): string[] {
  const available = new Set(
    products.map((product) => product.status.trim()).filter(Boolean),
  );

  const ordered = STATUS_ORDER.filter((status) => available.has(status));
  const additional = [...available]
    .filter((status) => !STATUS_ORDER.includes(status))
    .sort((left, right) => left.localeCompare(right, "es"));

  return [...ordered, ...additional];
}

export function ProductExplorer({
  loadProducts = loadAllProductsForAdmin,
  selectedProductIds = [],
  onSelectedProductIdsChange,
  onPrepareCatalog,
}: ProductExplorerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(ALL_ADMIN_FILTERS);
  const [category, setCategory] = useState(ALL_ADMIN_FILTERS);
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    loadProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((cause: unknown) => {
        if (!active) return;

        const message =
          cause instanceof Error
            ? cause.message
            : "No se pudo cargar la fuente administrativa.";

        setError(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadProducts, reloadToken]);

  const filteredProducts = useMemo(
    () =>
      filterAdminProducts(products, {
        query,
        status,
        category,
      }),
    [products, query, status, category],
  );

  const stats = useMemo(() => getProductExplorerStats(products), [products]);
  const statusOptions = useMemo(() => getStatusOptions(products), [products]);
  const categoryOptions = CATEGORIES.filter(
    (item) => item.id !== "todas" && item.id !== "all",
  );

  const hasFilters =
    Boolean(query.trim()) ||
    status !== ALL_ADMIN_FILTERS ||
    category !== ALL_ADMIN_FILTERS;
  const selectedProductIdSet = useMemo(
    () => new Set(selectedProductIds),
    [selectedProductIds],
  );

  const toggleProduct = (productId: string) => {
    if (!onSelectedProductIdsChange) return;

    const nextIds = selectedProductIdSet.has(productId)
      ? selectedProductIds.filter((id) => id !== productId)
      : [...selectedProductIds, productId];

    onSelectedProductIdsChange(nextIds);
  };

  const selectVisibleProducts = () => {
    if (!onSelectedProductIdsChange) return;

    onSelectedProductIdsChange([
      ...new Set([
        ...selectedProductIds,
        ...filteredProducts.map((product) => product.id),
      ]),
    ]);
  };

  const clearFilters = () => {
    setQuery("");
    setStatus(ALL_ADMIN_FILTERS);
    setCategory(ALL_ADMIN_FILTERS);
  };

  return (
    <section className="gla-explorer" aria-labelledby="gla-explorer-title">
      <header className="gla-explorer-header">
        <div>
          <div className="gla-explorer-kicker">
            <span>Product Explorer</span>
            <strong>Solo lectura · M2A</strong>
          </div>

          <h1 id="gla-explorer-title">Catálogo</h1>
          <p>
            Controla el inventario comercial completo, incluidos productos
            ocultos y borradores que no aparecen en la tienda.
          </p>
        </div>

        <button
          type="button"
          className="gla-refresh-button"
          onClick={() => setReloadToken((value) => value + 1)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "gla-spin" : ""} />
          Actualizar datos
        </button>
      </header>

      <div className="gla-metrics" aria-label="Resumen del catálogo">
        <article>
          <div className="gla-metric-icon gla-metric-icon-total">
            <Boxes size={18} aria-hidden="true" />
          </div>
          <div>
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
        </article>

        <article>
          <div className="gla-metric-icon gla-metric-icon-published">
            <PackageCheck size={18} aria-hidden="true" />
          </div>
          <div>
            <span>Publicados</span>
            <strong>{stats.published}</strong>
          </div>
        </article>

        <article>
          <div className="gla-metric-icon gla-metric-icon-preparation">
            <Archive size={18} aria-hidden="true" />
          </div>
          <div>
            <span>En preparación</span>
            <strong>{stats.preparation}</strong>
          </div>
        </article>

        <article>
          <div className="gla-metric-icon gla-metric-icon-stock">
            <PackageX size={18} aria-hidden="true" />
          </div>
          <div>
            <span>Sin stock</span>
            <strong>{stats.withoutStock}</strong>
          </div>
        </article>
      </div>

      <div className="gla-explorer-toolbar">
        <label className="gla-search-control">
          <span>Buscar productos</span>
          <div>
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Código, nombre, descripción o badge"
            />
          </div>
        </label>

        <label className="gla-select-control">
          <span>Estado</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value={ALL_ADMIN_FILTERS}>Todos los estados</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="gla-select-control">
          <span>Categoría</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value={ALL_ADMIN_FILTERS}>Todas las categorías</option>
            {categoryOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="gla-results-heading">
        <div>
          <strong>Productos</strong>
          <span aria-live="polite">
            {filteredProducts.length} de {products.length}
          </span>
        </div>

        {hasFilters ? (
          <button type="button" onClick={clearFilters}>
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {!loading && !error && products.length > 0 ? (
        <div className="gla-selection-bar" aria-label="Selección para catálogo">
          <div>
            <strong>{selectedProductIds.length} seleccionados</strong>
            <span>La selección viaja contigo a Catalog Workspace.</span>
          </div>

          <div>
            <button type="button" onClick={selectVisibleProducts}>
              Seleccionar visibles
            </button>
            {selectedProductIds.length > 0 ? (
              <button
                type="button"
                onClick={() => onSelectedProductIdsChange?.([])}
              >
                Limpiar selección
              </button>
            ) : null}
            <button
              type="button"
              className="gla-prepare-catalog"
              onClick={onPrepareCatalog}
              disabled={selectedProductIds.length === 0}
            >
              <FileText size={15} aria-hidden="true" />
              Preparar catálogo
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="gla-explorer-state" role="status">
          <Loader2 size={24} className="gla-spin" aria-hidden="true" />
          <strong>Cargando catálogo administrativo…</strong>
          <span>Sincronizando Google Sheets y media disponible.</span>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="gla-explorer-state gla-explorer-state-error" role="alert">
          <AlertCircle size={25} aria-hidden="true" />
          <strong>No se pudo cargar el catálogo</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setReloadToken((value) => value + 1)}>
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error && filteredProducts.length === 0 ? (
        <div className="gla-explorer-state">
          <Search size={25} aria-hidden="true" />
          <strong>No encontramos productos</strong>
          <span>Ajusta la búsqueda o limpia los filtros activos.</span>
          {hasFilters ? (
            <button type="button" onClick={clearFilters}>
              Limpiar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && filteredProducts.length > 0 ? (
        <div className="gla-product-list">
          {filteredProducts.map((product) => (
            <AdminProductRow
              key={product.id}
              product={product}
              selected={selectedProductIdSet.has(product.id)}
              onToggle={toggleProduct}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

import "./CatalogWorkspace.css";
import "./CatalogWorkspace.products.css";
import "./CatalogWorkspace.responsive.css";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  createCatalogCompositionDraft,
  moveProduct,
  resolveCatalogComposition,
  type CatalogCompositionDraft,
  type CatalogSortMode,
} from "@/application/admin/CatalogComposition";
import {
  loadAllCampaigns,
  loadAllProductsForAdmin,
  loadAllSubcategories,
} from "@/integrations/sheets/fetchSheets";
import type {
  Campaign,
  CatalogSubcategory,
  Product,
} from "@/shared/types/product";

import { CatalogBuilder } from "./CatalogBuilder";
import { CatalogCompositionPanel } from "./CatalogCompositionPanel";
import { CatalogPreviewDialog } from "./CatalogPreviewDialog";

export interface CatalogWorkspaceData {
  products: Product[];
  subcategories: CatalogSubcategory[];
  campaigns: Campaign[];
}

interface CatalogWorkspaceProps {
  selectedProductIds: readonly string[];
  onSelectedProductIdsChange: (productIds: string[]) => void;
  onBackToProducts: () => void;
  loadData?: () => Promise<CatalogWorkspaceData>;
}

async function loadCatalogWorkspaceData(): Promise<CatalogWorkspaceData> {
  const [products, subcategories, campaigns] = await Promise.all([
    loadAllProductsForAdmin(),
    loadAllSubcategories(),
    loadAllCampaigns(),
  ]);

  return { products, subcategories, campaigns };
}

function getScopeKey(draft: CatalogCompositionDraft): string {
  return [
    draft.mode,
    draft.categoryId,
    draft.subcategoryId,
    draft.campaignId,
    draft.customProductIds.join("|"),
  ].join("::");
}

export function CatalogWorkspace({
  selectedProductIds,
  onBackToProducts,
  loadData = loadCatalogWorkspaceData,
}: CatalogWorkspaceProps) {
  const [data, setData] = useState<CatalogWorkspaceData>({
    products: [],
    subcategories: [],
    campaigns: [],
  });
  const [draft, setDraft] = useState(() =>
    createCatalogCompositionDraft(selectedProductIds),
  );
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    loadData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo cargar el espacio de composición.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadData, reloadToken]);

  useEffect(() => {
    setDraft((current) => ({
      ...current,
      customProductIds: [...new Set(selectedProductIds)],
    }));
  }, [selectedProductIds]);

  const scopeKey = getScopeKey(draft);
  const composition = useMemo(
    () => resolveCatalogComposition(data.products, draft),
    [data.products, draft],
  );

  useEffect(() => {
    setDraft((current) => {
      const initialOrder = resolveCatalogComposition(data.products, {
        ...current,
        orderedProductIds: [],
      }).included.map((product) => product.id);

      return {
        ...current,
        orderedProductIds: initialOrder,
        manuallyExcludedProductIds: [],
        sortMode: "manual",
      };
    });
  }, [data.products, scopeKey]);

  const updateDraft = (patch: Partial<CatalogCompositionDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const moveIncludedProduct = (productId: string, direction: "up" | "down") => {
    setDraft((current) => ({
      ...current,
      sortMode: "manual",
      orderedProductIds: moveProduct(
        resolveCatalogComposition(data.products, current).included.map(
          (product) => product.id,
        ),
        productId,
        direction,
      ),
    }));
  };

  const excludeProduct = (productId: string) => {
    setDraft((current) => ({
      ...current,
      manuallyExcludedProductIds: [
        ...new Set([...current.manuallyExcludedProductIds, productId]),
      ],
    }));
  };

  const restoreProduct = (productId: string) => {
    setDraft((current) => ({
      ...current,
      manuallyExcludedProductIds: current.manuallyExcludedProductIds.filter(
        (id) => id !== productId,
      ),
    }));
  };

  const setSortMode = (sortMode: CatalogSortMode) => {
    updateDraft({ sortMode });
  };

  return (
    <section className="gla-catalog-workspace" aria-labelledby="gla-catalog-workspace-title">
      <header className="gla-catalog-workspace-header">
        <div>
          <div className="gla-catalog-workspace-kicker">
            <span>Catalog Workspace</span>
            <strong>Composición comercial</strong>
          </div>
          <h1 id="gla-catalog-workspace-title">Catálogos</h1>
          <p>
            Define el alcance comercial, ordena los productos y revisa la composición antes de generar cualquier salida.
          </p>
        </div>

        <button type="button" className="gla-workspace-back" onClick={onBackToProducts}>
          <ArrowLeft size={16} aria-hidden="true" />
          Product Explorer
        </button>
      </header>

      {loading ? (
        <div className="gla-workspace-state" role="status">
          <Loader2 size={25} className="gla-spin" aria-hidden="true" />
          <strong>Cargando fuentes de composición…</strong>
          <span>Productos, subcategorías y campañas.</span>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="gla-workspace-state gla-workspace-state-error" role="alert">
          <AlertCircle size={25} aria-hidden="true" />
          <strong>No se pudo preparar Catalog Workspace</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setReloadToken((value) => value + 1)}>
            <RefreshCw size={15} aria-hidden="true" />
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="gla-composition-metrics" aria-label="Resumen de la composición">
            <article><span>Incluidos</span><strong>{composition.included.length}</strong></article>
            <article><span>Excluidos automáticos</span><strong>{composition.automaticExcluded.length}</strong></article>
            <article><span>Excluidos manuales</span><strong>{composition.manuallyExcluded.length}</strong></article>
            <article><span>Productos disponibles</span><strong>{data.products.length}</strong></article>
          </div>

          <div className="gla-composition-layout">
            <div className="gla-builder-stack">
              <CatalogBuilder
                draft={draft}
                subcategories={data.subcategories}
                campaigns={data.campaigns}
                selectedProductCount={selectedProductIds.length}
                onDraftChange={updateDraft}
                onBackToProducts={onBackToProducts}
              />
              <section className="gla-catalog-settings" aria-labelledby="gla-catalog-settings-title">
                <div className="gla-builder-heading">
                  <span>03</span>
                  <div>
                    <strong id="gla-catalog-settings-title">Configuración</strong>
                    <small>Identidad del borrador comercial.</small>
                  </div>
                </div>
                <label className="gla-builder-control">
                  <span>Título del catálogo</span>
                  <input
                    value={draft.settings.title}
                    onChange={(event) => updateDraft({
                      settings: { ...draft.settings, title: event.target.value },
                    })}
                    placeholder="Ej. Detalles para enamorar"
                  />
                </label>
                <span className="gla-draft-status">Borrador</span>
              </section>
            </div>

            <CatalogCompositionPanel
              composition={composition}
              sortMode={draft.sortMode}
              onMove={moveIncludedProduct}
              onSortModeChange={setSortMode}
              onExclude={excludeProduct}
              onRestore={restoreProduct}
              onPreview={() => setPreviewOpen(true)}
            />
          </div>
        </>
      ) : null}

      {previewOpen ? (
        <CatalogPreviewDialog
          title={draft.settings.title}
          products={composition.included}
          excludedCount={composition.automaticExcluded.length + composition.manuallyExcluded.length}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </section>
  );
}

import "./QuotationWorkspace.css";
import "./QuotationWorkspace.lines.css";
import "./QuotationWorkspace.responsive.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";

import {
  createQuotationDraft,
  getQuotationTotals,
  isQuotationReady,
  updateQuotationLine,
  type QuotationClient,
  type QuotationConditions,
  type QuotationDraft,
  type QuotationLineSnapshot,
} from "@/application/admin/QuotationComposition";
import {
  createQuotationDraftStore,
  type QuotationDraftStore,
} from "@/infrastructure/admin/QuotationDraftStore";
import { loadAllProductsForAdmin } from "@/integrations/sheets/fetchSheets";
import type { Product } from "@/shared/types/product";

import { QuotationDetailsForm } from "./QuotationDetailsForm";
import { QuotationLineEditor } from "./QuotationLineEditor";
import { QuotationSummary } from "./QuotationSummary";

interface QuotationWorkspaceProps {
  selectedProductIds: readonly string[];
  onSelectedProductIdsChange: (productIds: string[]) => void;
  onBackToProducts: () => void;
  loadProducts?: () => Promise<Product[]>;
  draftStore?: QuotationDraftStore;
  now?: () => Date;
}

export function QuotationWorkspace({
  selectedProductIds,
  onSelectedProductIdsChange,
  onBackToProducts,
  loadProducts = loadAllProductsForAdmin,
  draftStore,
  now = () => new Date(),
}: QuotationWorkspaceProps) {
  const store = useMemo(
    () => draftStore ?? createQuotationDraftStore(window.localStorage),
    [draftStore],
  );
  const selectedProductIdsRef = useRef(selectedProductIds);
  const nowRef = useRef(now);
  selectedProductIdsRef.current = selectedProductIds;
  nowRef.current = now;
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<QuotationDraft | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<QuotationDraft[]>(() => store.list());
  const [reloadToken, setReloadToken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    loadProducts()
      .then((result) => {
        if (!active) return;
        setProducts(result);
        setDraft(
          createQuotationDraft(
            result,
            selectedProductIdsRef.current,
            nowRef.current(),
          ),
        );
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudo cargar la fuente administrativa.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [loadProducts, reloadToken]);

  const totals = useMemo(
    () => getQuotationTotals(draft?.lines ?? []),
    [draft?.lines],
  );

  const changeLine = (
    productId: string,
    patch: Partial<Pick<QuotationLineSnapshot, "quantity" | "unitPrice">>,
  ) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            lines: current.lines.map((line) =>
              line.productId === productId
                ? updateQuotationLine(line, patch)
                : line,
            ),
          }
        : current,
    );
  };

  const removeLine = (productId: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            lines: current.lines.filter((line) => line.productId !== productId),
          }
        : current,
    );
    onSelectedProductIdsChange(
      selectedProductIds.filter((id) => id !== productId),
    );
  };

  const changeClient = (patch: Partial<QuotationClient>) => {
    setDraft((current) =>
      current ? { ...current, client: { ...current.client, ...patch } } : current,
    );
  };

  const changeConditions = (patch: Partial<QuotationConditions>) => {
    setDraft((current) =>
      current
        ? { ...current, conditions: { ...current.conditions, ...patch } }
        : current,
    );
  };

  const saveDraft = () => {
    if (!draft) return;
    const updated = { ...draft, updatedAt: now().toISOString() };
    setDraft(updated);
    setSavedDrafts(store.save(updated));
    setStatusMessage("Borrador guardado en este navegador.");
  };

  const startNewDraft = () => {
    setDraft(createQuotationDraft(products, selectedProductIds, now()));
    setStatusMessage("");
  };

  return (
    <section className="gla-quotation-workspace" aria-labelledby="gla-quotation-title">
      <header className="gla-quotation-header">
        <div>
          <div className="gla-quotation-kicker">
            <span>Quotation Workspace</span>
            <strong>Composición · M4</strong>
          </div>
          <h1 id="gla-quotation-title">Cotizaciones</h1>
          <p>Congela productos y precios, completa al cliente y guarda un borrador comercial trazable.</p>
        </div>
        <div>
          <button type="button" onClick={startNewDraft} disabled={loading}>Nueva cotización</button>
          <button type="button" onClick={onBackToProducts}>
            <ArrowLeft size={16} aria-hidden="true" /> Product Explorer
          </button>
        </div>
      </header>

      {loading ? (
        <div className="gla-quotation-state" role="status">
          <Loader2 size={25} className="gla-spin" aria-hidden="true" />
          <strong>Preparando cotización…</strong>
          <span>Congelando los snapshots comerciales seleccionados.</span>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="gla-quotation-state gla-quotation-state-error" role="alert">
          <AlertCircle size={25} aria-hidden="true" />
          <strong>No se pudo preparar Quotation Workspace</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setReloadToken((value) => value + 1)}>
            <RefreshCw size={15} aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error && draft ? (
        <div className="gla-quotation-layout">
          <div className="gla-quotation-main">
            <section className="gla-quotation-products" aria-labelledby="gla-lines-title">
              <div className="gla-quotation-section-heading">
                <span>01</span>
                <div>
                  <h2 id="gla-lines-title">Productos y precios</h2>
                  <p>{draft.lines.length} líneas congeladas desde Product Explorer.</p>
                </div>
              </div>
              <QuotationLineEditor
                lines={draft.lines}
                onLineChange={changeLine}
                onRemove={removeLine}
              />
            </section>

            <QuotationDetailsForm
              client={draft.client}
              conditions={draft.conditions}
              onClientChange={changeClient}
              onConditionsChange={changeConditions}
            />
          </div>

          <QuotationSummary
            draft={draft}
            totals={totals}
            ready={isQuotationReady(draft)}
            savedDrafts={savedDrafts}
            statusMessage={statusMessage}
            onSave={saveDraft}
            onLoad={(saved) => {
              setDraft(saved);
              setStatusMessage("Borrador restaurado.");
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

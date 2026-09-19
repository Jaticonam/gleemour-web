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
  publishQuotationPdf,
  type QuotationDocumentPort,
  type QuotationDocumentResult,
} from "@/application/admin/QuotationPublishing";
import {
  createQuotationDraftStore,
  type QuotationDraftStore,
} from "@/infrastructure/admin/QuotationDraftStore";
import { loadAllProductsForAdmin } from "@/integrations/sheets/fetchSheets";
import { createJungCoreQuotationDocumentPort } from "@/integrations/jungCore/QuotationDocumentClient";
import { buildQuotationWhatsAppUrl } from "@/integrations/whatsapp/quotationWhatsapp";
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
  documentPort?: QuotationDocumentPort;
  openExternal?: (url: string) => void;
}

export type QuotationOutputState =
  | { status: "idle" }
  | { status: "publishing" }
  | QuotationDocumentResult;

export function QuotationWorkspace({
  selectedProductIds,
  onSelectedProductIdsChange,
  onBackToProducts,
  loadProducts = loadAllProductsForAdmin,
  draftStore,
  now = () => new Date(),
  documentPort,
  openExternal = (url) => window.open(url, "_blank", "noopener,noreferrer"),
}: QuotationWorkspaceProps) {
  const store = useMemo(
    () => draftStore ?? createQuotationDraftStore(window.localStorage),
    [draftStore],
  );
  const publisher = useMemo(
    () => documentPort ?? createJungCoreQuotationDocumentPort(),
    [documentPort],
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
  const [outputState, setOutputState] = useState<QuotationOutputState>({
    status: "idle",
  });

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
    setOutputState({ status: "idle" });
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
    setOutputState({ status: "idle" });
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
    setOutputState({ status: "idle" });
    setDraft((current) =>
      current ? { ...current, client: { ...current.client, ...patch } } : current,
    );
  };

  const changeConditions = (patch: Partial<QuotationConditions>) => {
    setOutputState({ status: "idle" });
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
    setOutputState({ status: "idle" });
  };

  const generatePdf = async () => {
    if (!draft || !isQuotationReady(draft)) return;
    const publishingDraft = { ...draft, updatedAt: now().toISOString() };
    setDraft(publishingDraft);
    setOutputState({ status: "publishing" });
    try {
      const result = await publishQuotationPdf(
        { draft: publishingDraft, requestedAt: now() },
        publisher,
      );
      setOutputState(result);
    } catch {
      setOutputState({
        status: "failed",
        code: "QUOTATION_PUBLICATION_FAILED",
        message: "No se pudo completar la publicación de la cotización.",
        retryable: true,
      });
    }
  };

  const sendWhatsapp = () => {
    if (!draft || !isQuotationReady(draft)) return;
    const publicUrl =
      outputState.status === "ready" ? outputState.publicUrl : undefined;
    openExternal(buildQuotationWhatsAppUrl(draft, publicUrl));
  };

  return (
    <section className="gla-quotation-workspace" aria-labelledby="gla-quotation-title">
      <header className="gla-quotation-header">
        <div>
          <div className="gla-quotation-kicker">
            <span>Quotation Workspace</span>
            <strong>Entrega comercial · M5</strong>
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
            outputState={outputState}
            onSave={saveDraft}
            onGeneratePdf={generatePdf}
            onWhatsapp={sendWhatsapp}
            onLoad={(saved) => {
              setDraft(saved);
              setStatusMessage("Borrador restaurado.");
              setOutputState({ status: "idle" });
            }}
          />
        </div>
      ) : null}
    </section>
  );
}

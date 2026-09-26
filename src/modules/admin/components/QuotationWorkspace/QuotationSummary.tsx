import { ExternalLink, FileDown, Loader2, MessageCircle, Save } from "lucide-react";

import type {
  QuotationDraft,
  QuotationTotals,
} from "@/application/admin/QuotationComposition";
import { getQuotationValidUntil } from "@/application/admin/QuotationComposition";
import type { QuotationOutputState } from "./QuotationWorkspace";

interface QuotationSummaryProps {
  draft: QuotationDraft;
  totals: QuotationTotals;
  ready: boolean;
  savedDrafts: readonly QuotationDraft[];
  statusMessage: string;
  outputState: QuotationOutputState;
  onSave: () => void;
  onGeneratePdf: () => void;
  onWhatsapp: () => void;
  onLoad: (draft: QuotationDraft) => void;
}

const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

function getDraftLabel(draft: QuotationDraft): string {
  return draft.client.name.trim() || "Cliente pendiente";
}

export function QuotationSummary({
  draft,
  totals,
  ready,
  savedDrafts,
  statusMessage,
  outputState,
  onSave,
  onGeneratePdf,
  onWhatsapp,
  onLoad,
}: QuotationSummaryProps) {
  return (
    <aside className="gla-quotation-summary">
      <div className="gla-quotation-section-heading">
        <span>03</span>
        <div>
          <h2>Resumen</h2>
          <p>{ready ? "Cotización preparada" : "Completa cliente y productos"}</p>
        </div>
      </div>

      <dl className="gla-quotation-totals">
        <div><dt>Productos</dt><dd>{totals.lineCount}</dd></div>
        <div><dt>Unidades</dt><dd>{totals.totalUnits}</dd></div>
        <div className="gla-quotation-total"><dt>Total</dt><dd>{PEN_FORMATTER.format(totals.total)}</dd></div>
        <div><dt>Válida hasta</dt><dd>{getQuotationValidUntil(draft.conditions) || "Pendiente"}</dd></div>
      </dl>

      <button type="button" className="gla-save-draft" onClick={onSave}>
        <Save size={16} aria-hidden="true" />
        Guardar borrador
      </button>
      {statusMessage ? <p className="gla-save-status" role="status">{statusMessage}</p> : null}

      <div className="gla-quotation-outputs">
        <button type="button" disabled={!ready} onClick={onWhatsapp}>
          <MessageCircle size={16} aria-hidden="true" />
          Enviar por WhatsApp
        </button>
        <button
          type="button"
          disabled={!ready || outputState.status === "publishing"}
          onClick={onGeneratePdf}
        >
          {outputState.status === "publishing" ? (
            <Loader2 size={16} className="gla-spin" aria-hidden="true" />
          ) : (
            <FileDown size={16} aria-hidden="true" />
          )}
          {outputState.status === "publishing" ? "Publicando…" : "Generar PDF"}
        </button>
        {outputState.status === "ready" ? (
          <a href={outputState.pdf.url} target="_blank" rel="noreferrer">
            <ExternalLink size={14} aria-hidden="true" /> Abrir PDF publicado
          </a>
        ) : null}
        {outputState.status === "pending" ? (
          <small role="status">{outputState.message}</small>
        ) : null}
        {outputState.status === "unavailable" || outputState.status === "failed" ? (
          <small role="alert">{outputState.message}</small>
        ) : null}
        {outputState.status === "idle" ? (
          <small>PDF vía JUNG CORE; WhatsApp funciona con o sin documento publicado.</small>
        ) : null}
      </div>

      <div className="gla-saved-drafts">
        <div>
          <strong>Borradores locales</strong>
          <span>{savedDrafts.length}</span>
        </div>
        {savedDrafts.length > 0 ? (
          <ul>
            {savedDrafts.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => onLoad(item)}>
                  <strong>{getDraftLabel(item)}</strong>
                  <span>{item.lines.length} productos · {item.conditions.issueDate}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aún no guardaste cotizaciones en este navegador.</p>
        )}
      </div>
    </aside>
  );
}

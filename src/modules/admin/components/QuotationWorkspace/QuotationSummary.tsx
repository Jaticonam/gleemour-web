import { FileDown, MessageCircle, Save } from "lucide-react";

import type {
  QuotationDraft,
  QuotationTotals,
} from "@/application/admin/QuotationComposition";

interface QuotationSummaryProps {
  draft: QuotationDraft;
  totals: QuotationTotals;
  ready: boolean;
  savedDrafts: readonly QuotationDraft[];
  statusMessage: string;
  onSave: () => void;
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
  onSave,
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
      </dl>

      <button type="button" className="gla-save-draft" onClick={onSave}>
        <Save size={16} aria-hidden="true" />
        Guardar borrador
      </button>
      {statusMessage ? <p className="gla-save-status" role="status">{statusMessage}</p> : null}

      <div className="gla-future-outputs">
        <button type="button" disabled>
          <MessageCircle size={16} aria-hidden="true" />
          Enviar por WhatsApp
        </button>
        <button type="button" disabled>
          <FileDown size={16} aria-hidden="true" />
          Generar PDF
        </button>
        <small>Salidas bloqueadas hasta integrar JUNG CORE Commercial Publishing.</small>
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

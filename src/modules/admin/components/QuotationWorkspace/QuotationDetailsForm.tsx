import type {
  QuotationClient,
  QuotationConditions,
} from "@/application/admin/QuotationComposition";

interface QuotationDetailsFormProps {
  client: QuotationClient;
  conditions: QuotationConditions;
  onClientChange: (patch: Partial<QuotationClient>) => void;
  onConditionsChange: (patch: Partial<QuotationConditions>) => void;
}

export function QuotationDetailsForm({
  client,
  conditions,
  onClientChange,
  onConditionsChange,
}: QuotationDetailsFormProps) {
  return (
    <section className="gla-quotation-details" aria-labelledby="gla-client-title">
      <div className="gla-quotation-section-heading">
        <span>02</span>
        <div>
          <h2 id="gla-client-title">Cliente y condiciones</h2>
          <p>Datos mínimos para preparar una salida comercial.</p>
        </div>
      </div>

      <div className="gla-client-grid">
        <label>
          <span>Nombre del cliente *</span>
          <input
            value={client.name}
            onChange={(event) => onClientChange({ name: event.target.value })}
            placeholder="Nombre o empresa"
          />
        </label>
        <label>
          <span>WhatsApp *</span>
          <input
            value={client.whatsapp}
            onChange={(event) => onClientChange({ whatsapp: event.target.value })}
            placeholder="Número con código de país"
            inputMode="tel"
          />
        </label>
        <label>
          <span>Tipo de documento</span>
          <select
            value={client.documentType ?? ""}
            onChange={(event) => onClientChange({
              documentType: event.target.value as QuotationClient["documentType"],
            })}
          >
            <option value="">Sin especificar</option>
            <option value="DNI">DNI</option>
            <option value="RUC">RUC</option>
            <option value="Otro">Otro</option>
          </select>
        </label>
        <label>
          <span>Número de documento</span>
          <input
            value={client.documentNumber ?? client.document}
            onChange={(event) => onClientChange({
              documentNumber: event.target.value,
              document: event.target.value,
            })}
            placeholder="Número"
          />
        </label>
        <label>
          <span>Fecha de emisión</span>
          <input
            type="date"
            value={conditions.issueDate}
            onChange={(event) =>
              onConditionsChange({ issueDate: event.target.value })
            }
          />
        </label>
        <label>
          <span>Validez (días)</span>
          <input
            type="number"
            min="1"
            max="90"
            value={conditions.validityDays}
            onChange={(event) =>
              onConditionsChange({
                validityDays: Math.max(1, Number(event.target.value) || 1),
              })
            }
          />
        </label>
        <label className="gla-notes-control">
          <span>Notas comerciales</span>
          <textarea
            value={conditions.notes}
            onChange={(event) => onConditionsChange({ notes: event.target.value })}
            placeholder="Entrega, personalización, condiciones especiales…"
            rows={4}
          />
        </label>
      </div>
    </section>
  );
}

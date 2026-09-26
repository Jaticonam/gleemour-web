import {
  getQuotationTotals,
  getQuotationLineSubtotal,
  normalizeQuotationWhatsapp,
  type QuotationSnapshot,
} from "@/application/admin/QuotationComposition";

const PEN_FORMATTER = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
});

export function buildQuotationWhatsAppMessage(
  draft: QuotationSnapshot,
  publicUrl?: string,
): string {
  const totals = getQuotationTotals(draft.lines);
  const lines = draft.lines.map(
    (line) =>
      `• ${line.quantity} × ${line.productName} — ${PEN_FORMATTER.format(getQuotationLineSubtotal(line))}`,
  );
  const sections = [
    "*✨ Cotización Gleemour*",
    `Hola ${draft.client.name.trim()}, preparamos tu cotización ${draft.id}:`,
    lines.join("\n"),
    `*Total: ${PEN_FORMATTER.format(totals.total)}*`,
    `Vigencia: ${draft.conditions.validityDays} día(s) desde ${draft.conditions.issueDate}.`,
  ];

  if (draft.conditions.notes.trim()) {
    sections.push(`Condiciones: ${draft.conditions.notes.trim()}`);
  }
  if (publicUrl) sections.push(`Documento: ${publicUrl}`);
  sections.push("Quedamos atentos para confirmar disponibilidad, entrega y dedicatoria. 💐");

  return sections.join("\n\n");
}

export function buildQuotationWhatsAppUrl(
  draft: QuotationSnapshot,
  publicUrl?: string,
): string {
  const number = normalizeQuotationWhatsapp(draft.client.whatsapp);
  return `https://wa.me/${number}?text=${encodeURIComponent(
    buildQuotationWhatsAppMessage(draft, publicUrl),
  )}`;
}

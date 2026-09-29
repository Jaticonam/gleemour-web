/** Eventos semánticos del recorrido comercial. No contienen datos personales. */
export type CommerceEvent =
  | { type: "catalog_view"; categoryId: string; campaignId?: string; resultCount: number }
  | { type: "catalog_search"; queryLength: number; resultCount: number; categoryId: string; campaignId?: string }
  | { type: "catalog_category_select"; categoryId: string }
  | { type: "catalog_campaign_select"; campaignId: string; campaignName: string }
  | { type: "catalog_discover_select"; discoverId: "nuevo" | "premium" | "last-units" }
  | { type: "catalog_filter_applied"; source: "filter_panel"; availability: "all" | "available" | "last-units"; subcategory?: string; minPrice?: number; maxPrice?: number; resultCount: number }
  | { type: "catalog_filters_cleared"; source: "filter_panel" | "filter_chip" | "empty_state"; count: number }
  | { type: "catalog_sort_changed"; sortId: "featured" | "price-asc" | "price-desc"; resultCount: number }
  | { type: "catalog_product_open"; source: "catalog_card"; productId: string; categoryId: string; effectivePrice: number }
  | { type: "catalog_product_customize"; source: "catalog_card" | "product_detail"; productId: string }
  | { type: "catalog_product_whatsapp_click"; source: "catalog_card" | "product_detail"; productId: string; effectivePrice: number }
  | { type: "catalog_help_choose"; source: "catalog_header"; categoryId: string; campaignId?: string; hasSearch: boolean };

export type CommerceEventSink = (event: CommerceEvent) => void | Promise<void>;

// Un proveedor futuro se registra aquí. Sin proveedor, la emisión es no-op.
const noOp: CommerceEventSink = () => {};
let sink: CommerceEventSink = noOp;

export function setCommerceEventSink(next: CommerceEventSink | null): void {
  sink = next ?? noOp;
}

export function trackCommerceEvent(event: CommerceEvent): void {
  if (sink === noOp) return;
  try {
    void Promise.resolve(sink(event)).catch(() => {});
  } catch {
    // La medición nunca bloquea una acción comercial.
  }
}

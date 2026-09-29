import { afterEach, describe, expect, it, vi } from "vitest";
import { setCommerceEventSink, trackCommerceEvent } from "./commerceEvents";

afterEach(() => setCommerceEventSink(null));

describe("commerceEvents", () => {
  it("no-op sin proveedor y entrega un evento tipado al adapter registrado", () => {
    expect(() => trackCommerceEvent({ type: "catalog_view", categoryId: "todas", resultCount: 4 })).not.toThrow();
    const sink = vi.fn();
    setCommerceEventSink(sink);
    const event = { type: "catalog_product_whatsapp_click" as const,
      source: "catalog_card" as const, productId: "GLE-001", effectivePrice: 95 };
    trackCommerceEvent(event);
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith(event);
  });

  it("no propaga fallos síncronos ni asíncronos del adapter", async () => {
    setCommerceEventSink(() => { throw new Error("offline"); });
    expect(() => trackCommerceEvent({ type: "catalog_category_select", categoryId: "flores" })).not.toThrow();
    setCommerceEventSink(() => Promise.reject(new Error("offline")));
    expect(() => trackCommerceEvent({ type: "catalog_category_select", categoryId: "flores" })).not.toThrow();
    await Promise.resolve();
  });
});

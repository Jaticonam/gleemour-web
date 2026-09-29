import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setCommerceEventSink } from "@/core/services/commerceEvents";
import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";
import type { Product } from "@/shared/types/product";
import { useProductActions } from "./useProductActions";

afterEach(() => { setCommerceEventSink(null); vi.restoreAllMocks(); });

describe("useProductActions", () => {
  it("registra WhatsApp desde detalle y conserva una sola apertura", () => {
    const product = {
      id: "GLE-001", title: "Ramo", description: "", category: "para-enamorar",
      price: 120, offer_price: 95, stock: 2, status: "Publicado",
    } as Product;
    const sink = vi.fn();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    setCommerceEventSink(sink);
    const { result } = renderHook(() => useProductActions({ product, qty: 1 }));
    act(() => result.current.handleWhatsApp());
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith({
      type: "catalog_product_whatsapp_click", source: "product_detail",
      productId: product.id, effectivePrice: 95,
    });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      buildProductWhatsAppUrl({ product, qty: 1 }), "_blank", "noopener,noreferrer",
    );
  });
});

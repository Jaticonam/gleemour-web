import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { setCommerceEventSink } from "@/core/services/commerceEvents";
import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";
import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import type { Product } from "@/shared/types/product";

import ProductPage from "./ProductPage";

vi.mock("@/integrations/sheets/fetchSheets", () => ({ loadAllProducts: vi.fn() }));
vi.mock("@/modules/catalog/components/overlays/RecentActivity", () => ({ RecentActivity: () => null }));

const product: Product = {
  id: "GLE-001", title: "Rosas especiales", description: "Rosas y dedicatoria.",
  category: "para-enamorar", categories: ["para-enamorar"], subcategories: [],
  price: 120, offer_price: 95, stock: 2, img: "/rosa.jpg", images: ["/rosa.jpg", "/detalle.jpg"],
  priority: 1, status: "Publicado", badges: [], attributes: [], addons: [],
};

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderDetail(path = "/catalogo/p/GLE-001.html") {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/catalogo/producto.html" element={<ProductPage />} />
        <Route path="/catalogo/p/:id" element={<ProductPage />} />
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  setCommerceEventSink(null);
});

describe("ProductDetail V2", () => {
  it("muestra producto, precio, stock, galería real y acciones comerciales", async () => {
    vi.mocked(loadAllProducts).mockResolvedValue([product]);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderDetail();

    expect(await screen.findByRole("heading", { name: product.title, level: 1 })).toBeInTheDocument();
    expect(document.title).toBe("Rosas especiales | Gleemour");
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute("href", "https://gleemour.com/catalogo/p/GLE-001.html");
    expect(document.head.querySelector('meta[property="og:image"]')).toHaveAttribute("content", "https://gleemour.com/og/home.jpg");
    expect(screen.getByText("S/ 95.00")).toBeInTheDocument();
    expect(screen.getByText("S/ 120.00").tagName).toBe("DEL");
    expect(screen.getByText("Últimos 2")).toBeInTheDocument();
    expect(screen.getByText("Rosas y dedicatoria.")).toBeInTheDocument();
    expect(screen.getByText("Código: GLE-001")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute("src", "/rosa.jpg");
    const second = screen.getByRole("button", { name: "Ver imagen 2" });
    expect(second).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute("src", "/detalle.jpg");
    expect(screen.queryByRole("button", { name: /carrito/i })).not.toBeInTheDocument();
  });

  it("conserva WhatsApp y Experience Studio con un evento por acción", async () => {
    vi.mocked(loadAllProducts).mockResolvedValue([product]);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    const sink = vi.fn();
    setCommerceEventSink(sink);
    renderDetail();
    const actions = await screen.findByRole("region", { name: "Precio y acciones del producto" });
    fireEvent.click(within(actions).getByRole("button", { name: "Consultar por WhatsApp" }));
    expect(open).toHaveBeenCalledWith(buildProductWhatsAppUrl({ product, qty: 1 }), "_blank", "noopener,noreferrer");
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith({
      type: "catalog_product_whatsapp_click", source: "product_detail", productId: product.id, effectivePrice: 95,
    });
    fireEvent.click(within(actions).getByRole("button", { name: "Personalizar experiencia" }));
    expect(sink).toHaveBeenCalledTimes(2);
    expect(sink).toHaveBeenLastCalledWith({
      type: "catalog_product_customize", source: "product_detail", productId: product.id,
    });
    expect(screen.getByTestId("location")).toHaveTextContent("/experiencia?origen=producto&producto=GLE-001");
  });

  it("resuelve deep link, retorno y producto inexistente sin galería falsa", async () => {
    vi.mocked(loadAllProducts).mockResolvedValue([{ ...product, images: [], stock: 0, status: "Agotado" }]);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderDetail();
    expect(await screen.findByText("Agotado")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ver imagen/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Volver al catálogo" }));
    expect(screen.getByTestId("location")).toHaveTextContent("/catalogo");
  });

  it("ofrece volver al catálogo para un identificador desconocido", async () => {
    vi.mocked(loadAllProducts).mockResolvedValue([product]);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderDetail("/catalogo/producto.html?id=inexistente");
    await waitFor(() => expect(screen.getByRole("button", { name: "Volver al catálogo" })).toBeInTheDocument());
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  });

  it("conserva una imagen de respaldo real y evita miniaturas sin imágenes adicionales", async () => {
    vi.mocked(loadAllProducts).mockResolvedValue([{ ...product, img: "", images: [] }]);
    vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderDetail();
    expect(await screen.findByRole("img", { name: product.title })).toHaveAttribute("src", "/placeholder.svg");
    expect(screen.queryByRole("button", { name: /Ver imagen/ })).not.toBeInTheDocument();
  });
});

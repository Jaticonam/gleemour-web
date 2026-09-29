import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { buildProductWhatsAppUrl } from "@/integrations/whatsapp/whatsapp";
import { setCommerceEventSink } from "@/core/services/commerceEvents";
import type { Product } from "@/shared/types/product";

import { ProductCard } from "./ProductCard";

const product: Product = {
  id: "GLE-001",
  title: "Ramo de rosas para una ocasión especial",
  description: "Una descripción extensa que pertenece al detalle.",
  category: "para-enamorar",
  categories: ["para-enamorar"],
  subcategories: [],
  price: 120,
  offer_price: 95,
  stock: 2,
  img: "/ramo.jpg",
  priority: 1,
  status: "Publicado",
  badges: ["Oferta", "Nuevo"],
  attributes: ["natural"],
  addons: [],
};

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderCard(value: Product = product) {
  render(
    <MemoryRouter initialEntries={["/catalogo"]}>
      <ProductCard product={value} />
      <Routes>
        <Route path="*" element={<Location />} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => { vi.restoreAllMocks(); setCommerceEventSink(null); });

describe("ProductCard", () => {
  it("muestra una sola señal comercial, precio de oferta y contenido compacto", () => {
    renderCard();

    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute("src", product.img);
    expect(screen.getByText("S/ 120.00")).toBeInTheDocument();
    expect(screen.getByText("95.00")).toBeInTheDocument();
    expect(screen.getByText("Últimos 2")).toBeInTheDocument();
    expect(screen.getByText(/Oferta/)).toBeInTheDocument();
    expect(screen.queryByText("Nuevo")).not.toBeInTheDocument();
    expect(screen.queryByText(/Ref\. GLE-001/)).not.toBeInTheDocument();
    expect(screen.queryByText(product.description)).not.toBeInTheDocument();
    expect(screen.queryByText(/viendo ahora/)).not.toBeInTheDocument();
  });

  it("abre el detalle desde la imagen, nombre y área principal", () => {
    renderCard();
    const destination = "/catalogo/p/GLE-001.html";
    expect(screen.getByRole("link", { name: `Ver detalle de ${product.title}` })).toHaveAttribute("href", destination);
    fireEvent.click(screen.getByRole("link", { name: `Ver detalle de ${product.title}` }));
    expect(screen.getByTestId("location")).toHaveTextContent(destination);
    const nameLink = screen.getByRole("heading", { name: product.title }).closest("a");
    expect(nameLink).toHaveAttribute("href", destination);
    fireEvent.click(nameLink!);
    expect(screen.getByTestId("location")).toHaveTextContent(destination);
  });

  it("mantiene Personalizar separado del CTA WhatsApp y conserva el mensaje", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderCard();

    const whatsapp = screen.getByRole("button", { name: `Consultar ${product.title} por WhatsApp` });
    fireEvent.click(whatsapp);
    expect(open).toHaveBeenCalledWith(buildProductWhatsAppUrl({ product, qty: 1 }), "_blank", "noopener,noreferrer");
    expect(screen.getByTestId("location")).toHaveTextContent("/catalogo");

    const personalize = screen.getByRole("button", { name: `Personalizar ${product.title}` });
    expect(personalize).toHaveAttribute("title", "Personalizar");
    fireEvent.click(personalize);
    expect(screen.getByTestId("location")).toHaveTextContent("/experiencia?origen=producto&producto=GLE-001");
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("conserva fallback y consulta de reposición para un producto agotado", () => {
    const soldOut = { ...product, stock: 0, status: "Agotado", img: "", offer_price: null };
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderCard(soldOut);

    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute("src", "/product-fallback.svg");
    expect(screen.getByText("Agotado")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: `Consultar ${product.title} por WhatsApp` }));
    expect(open).toHaveBeenCalledWith(buildProductWhatsAppUrl({ product: soldOut, qty: 1 }), "_blank", "noopener,noreferrer");
  });

  it("conserva fotos válidas y reemplaza una URL rota con el SVG local sin repetir errores", () => {
    renderCard({ ...product, img: "https://example.com/ramo.jpg" });
    const image = screen.getByRole("img", { name: product.title });
    expect(image).toHaveAttribute("src", "https://example.com/ramo.jpg");

    fireEvent.error(image);
    expect(screen.getByRole("img", { name: product.title })).toHaveAttribute("src", "/product-fallback.svg");
    fireEvent.error(screen.getByRole("img", { name: product.title }));
    expect(screen.queryByRole("img", { name: product.title })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Ver detalle de ${product.title}` })).toHaveAttribute(
      "href", "/catalogo/p/GLE-001.html",
    );
  });

  it("mantiene Premium solo si está presente en los datos del producto", () => {
    renderCard({ ...product, badges: ["Premium"] });
    expect(screen.getByText(/Premium/)).toHaveClass("product-card-badge", "product-badge--premium");
    expect(screen.queryByText(/Oferta/)).not.toBeInTheDocument();
  });

  it("emite apertura, personalización y WhatsApp una vez sin alterar el destino", () => {
    const sink = vi.fn();
    setCommerceEventSink(sink);
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderCard();
    expect(sink).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: `Ver detalle de ${product.title}` }));
    expect(sink).toHaveBeenLastCalledWith({
      type: "catalog_product_open", source: "catalog_card", productId: product.id,
      categoryId: product.category, effectivePrice: 95,
    });
    fireEvent.click(screen.getByRole("button", { name: `Consultar ${product.title} por WhatsApp` }));
    expect(sink).toHaveBeenCalledTimes(2);
    expect(sink).toHaveBeenLastCalledWith({
      type: "catalog_product_whatsapp_click", source: "catalog_card", productId: product.id,
      effectivePrice: 95,
    });
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      buildProductWhatsAppUrl({ product, qty: 1 }), "_blank", "noopener,noreferrer",
    );
    fireEvent.click(screen.getByRole("button", { name: `Personalizar ${product.title}` }));
    expect(sink).toHaveBeenCalledTimes(3);
    expect(sink).toHaveBeenLastCalledWith({
      type: "catalog_product_customize", source: "catalog_card", productId: product.id,
    });
    expect(screen.getByTestId("location")).toHaveTextContent("/experiencia?origen=producto&producto=GLE-001");
  });

  it("abre WhatsApp aunque falle el adapter", () => {
    setCommerceEventSink(() => { throw new Error("sin proveedor"); });
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: `Consultar ${product.title} por WhatsApp` }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith(
      buildProductWhatsAppUrl({ product, qty: 1 }), "_blank", "noopener,noreferrer",
    );
  });
});

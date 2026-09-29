import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/integrations/sheets/fetchSheets", () => ({
  loadAllProducts: vi.fn().mockResolvedValue([{
    id: "GLE-001", title: "Ramo de rosas", description: "Un detalle especial",
    category: "para-enamorar", categories: [], subcategories: [], campaigns: ["hwd"],
    price: 85, offer_price: null, stock: 5, img: "", priority: 1,
    status: "Publicado", badges: ["premium"], attributes: [], addons: [],
  }]),
  loadAllCampaigns: vi.fn().mockResolvedValue([{
    id: "hwd", name: "Hot Wheels Day", computedStatus: "activa", publicationStatus: "Publicado",
  }]),
}));

import CatalogPage from "./CatalogPage";

describe("CatalogPage: cabecera real", () => {
  it("monta la marca y controles aprobados sin el hero textual antiguo", async () => {
    render(<MemoryRouter initialEntries={["/catalogo"]}><CatalogPage /></MemoryRouter>);
    const header = await screen.findByRole("banner");
    expect(within(header).getByRole("heading", { level: 1 })).toHaveAccessibleName("Gleemour");
    expect(within(header).getByRole("navigation", { name: "Categorías" })).toBeInTheDocument();
    expect(within(header).getByRole("group", { name: "Descubre" })).toHaveTextContent("Premium");
    expect(within(header).getByRole("button", { name: /Hot Wheels Day/ })).toBeInTheDocument();
    expect(within(header).getByPlaceholderText("¿Qué ocasión o emoción buscas?")).toBeInTheDocument();
    expect(within(header).getByRole("link", { name: /Inspírame/ })).toHaveAttribute("href", "/experiencia?origen=catalogo");
    for (const obsolete of [/Catálogo emocional/i, /^Catálogo$/, /Ramos, arreglos/i,
      /Detalles para emocionar/i, /Ayúdame a elegir/i, /Te ayudamos/i]) {
      expect(within(header).queryByText(obsolete)).not.toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Filtros" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Ordenar productos" })).toHaveValue("featured");
    expect(screen.getByRole("button", { name: /Consultar.*WhatsApp/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Personalizar/i })).toBeInTheDocument();
    expect(screen.getByAltText("Ramo de rosas")).toHaveAttribute("src", "/product-fallback.svg");
    expect(screen.getByRole("link", { name: "Ayuda general por WhatsApp" })).toHaveTextContent("Ayuda");
  });
});

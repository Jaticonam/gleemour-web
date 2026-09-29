import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loaders = vi.hoisted(() => ({ products: vi.fn(), campaigns: vi.fn() }));
vi.mock("@/integrations/sheets/fetchSheets", () => ({
  loadAllProducts: loaders.products,
  loadAllCampaigns: loaders.campaigns,
}));
vi.mock("@/modules/catalog/components/catalog/CatalogTopNav", () => ({
  CatalogTopNav: ({ searchSlot, onCategorySelect }: {
    searchSlot: React.ReactNode; onCategorySelect: (value: string) => void;
  }) => <div>{searchSlot}<button onClick={() => onCategorySelect("special")}>Otra categoría</button></div>,
}));
vi.mock("@/modules/catalog/components/search/SearchInput", () => ({
  SearchInput: ({ value, onChange }: { value: string; onChange: (value: string) => void }) =>
    <input aria-label="Buscar productos" value={value} onChange={(event) => onChange(event.target.value)} />,
}));
vi.mock("@/modules/catalog/components/catalog/CatalogResultsToolbar", () => ({
  CatalogResultsToolbar: ({ onFiltersChange }: { onFiltersChange: (value: object) => void }) =>
    <button onClick={() => onFiltersChange({ minPrice: "999", maxPrice: "", availability: "all", subcategory: "" })}>Filtrar</button>,
}));
vi.mock("@/shared/components/overlays/FloatingButtons", () => ({ FloatingButtons: () => null }));
vi.mock("@/modules/catalog/components/overlays/RecentActivity", () => ({ RecentActivity: () => null }));
vi.mock("@/shared/components/feedback/NotificationStack", () => ({ NotificationStack: () => null, showNotification: vi.fn() }));

import CatalogPage from "./CatalogPage";

describe("CatalogPage: estados de resultados", () => {
  beforeEach(() => {
    loaders.products.mockReset().mockResolvedValue([]);
    loaders.campaigns.mockReset().mockResolvedValue([]);
  });

  const showPage = () => render(<MemoryRouter><CatalogPage /></MemoryRouter>);

  it("separa búsqueda, filtros y selección vacíos y permite volver", async () => {
    showPage();
    expect(await screen.findByText("No encontramos productos en esta selección.")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Buscar productos" }), { target: { value: "rosas" } });
    expect(screen.getByText("No encontramos productos para tu búsqueda.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(screen.getByRole("textbox", { name: "Buscar productos" })).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));
    expect(screen.getByText("No encontramos productos con estos filtros.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByText("No encontramos productos en esta selección.")).toBeInTheDocument();
  });

  it("muestra un error distinto si falla la carga de productos", async () => {
    loaders.products.mockRejectedValueOnce(new Error("unavailable"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      showPage();
      expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos cargar los productos.");
      expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
      expect(screen.queryByText("No encontramos productos en esta selección.")).not.toBeInTheDocument();
    } finally {
      consoleError.mockRestore();
    }
  });
});

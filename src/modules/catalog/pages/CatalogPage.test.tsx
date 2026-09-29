import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const loaders = vi.hoisted(() => ({ products: vi.fn(), campaigns: vi.fn() }));
vi.mock("@/integrations/sheets/fetchSheets", () => ({
  loadAllProducts: loaders.products,
  loadAllCampaigns: loaders.campaigns,
}));
vi.mock("@/modules/catalog/components/catalog/CatalogTopNav", () => ({
  CatalogTopNav: ({ searchSlot, onCategorySelect, campaignItems, onCampaignSelect }: {
    searchSlot: React.ReactNode; onCategorySelect: (value: string) => void;
    campaignItems: Array<{ id: string; name: string }>;
    onCampaignSelect: (value: string) => void;
  }) => <div>{searchSlot}<button onClick={() => onCategorySelect("special")}>Otra categoría</button>
    {campaignItems.map((item) => <button key={item.id} onClick={() => onCampaignSelect(item.id)}>{item.name}</button>)}
  </div>,
}));
vi.mock("@/modules/catalog/components/product/ProductCard", () => ({
  ProductCard: ({ product }: { product: { title: string } }) => <article>{product.title}</article>,
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
import { normalizeCampaign } from "@/integrations/sheets/normalizeCampaign";
import type { Product } from "@/shared/types/product";

describe("CatalogPage: estados de resultados", () => {
  beforeEach(() => {
    loaders.products.mockReset().mockResolvedValue([]);
    loaders.campaigns.mockReset().mockResolvedValue([]);
  });

  function LocationProbe() {
    const location = useLocation();
    const navigate = useNavigate();
    return <div data-testid="location">{location.search}
      <button onClick={() => navigate(-1)}>Atrás</button>
      <button onClick={() => navigate(1)}>Adelante</button>
    </div>;
  }
  const showPage = (path = "/catalogo") => render(
    <MemoryRouter initialEntries={[path]}><CatalogPage /><LocationProbe /></MemoryRouter>,
  );

  function setCampaignFixtures() {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 15, 12));
    const rows = [
      { id: "vigente", name: "Vigente", startdate: "01/09/2026", enddate: "30/09/2026", publicationstatus: "Publicado" },
      { id: "futura", name: "Futura", startdate: "01/10/2026", enddate: "30/10/2026", publicationstatus: "Publicado" },
      { id: "finalizada", name: "Finalizada", startdate: "01/08/2026", enddate: "31/08/2026", publicationstatus: "Publicado" },
      { id: "oculta", name: "Oculta", startdate: "01/09/2026", enddate: "30/09/2026", publicationstatus: "Oculto" },
      { id: "borrador", name: "Borrador", startdate: "01/09/2026", enddate: "30/09/2026", publicationstatus: "Borrador" },
    ];
    const campaigns = rows.map(normalizeCampaign);
    vi.useRealTimers();
    loaders.campaigns.mockResolvedValue(campaigns);
    loaders.products.mockResolvedValue(rows.map((row) => ({
      id: row.id, title: `Producto ${row.name}`, description: "", category: "para-enamorar",
      categories: [], subcategories: [], campaigns: [row.id], price: 50, offer_price: null,
      stock: 10, img: "", priority: 1, status: "Publicado", badges: [], attributes: [], addons: [],
    } satisfies Product)));
  }

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

  it("muestra solo campañas activas con productos y conserva navegación válida", async () => {
    setCampaignFixtures();
    showPage("/catalogo?origen=compartido");
    expect(await screen.findByRole("button", { name: "Vigente" })).toBeInTheDocument();
    for (const hidden of ["Futura", "Finalizada", "Oculta", "Borrador"]) {
      expect(screen.queryByRole("button", { name: hidden })).not.toBeInTheDocument();
    }
    expect(screen.getByText("Producto Futura")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Vigente" }));
    expect(screen.getByTestId("location")).toHaveTextContent("campaign=vigente");
    expect(screen.queryByText("Producto Futura")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Atrás" }));
    expect(await screen.findByText("Producto Futura")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Adelante" }));
    expect(await screen.findByText("Producto Vigente")).toBeInTheDocument();
  });

  it("respeta el enlace compartido de una campaña activa", async () => {
    setCampaignFixtures();
    showPage("/catalogo?campaign=vigente");
    expect(await screen.findByText("Producto Vigente")).toBeInTheDocument();
    expect(screen.queryByText("Producto Futura")).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).toHaveTextContent("campaign=vigente");
  });

  it.each(["futura", "finalizada", "oculta", "borrador"])(
    "descarta un deep link %s sin filtrar productos ni perder otros parámetros", async (campaign) => {
      setCampaignFixtures();
      showPage(`/catalogo?origen=compartido&campaign=${campaign}`);
      expect(await screen.findByText("Producto Vigente")).toBeInTheDocument();
      expect(screen.getByTestId("location")).toHaveTextContent("origen=compartido");
      expect(screen.getByTestId("location")).not.toHaveTextContent("campaign=");
    },
  );

  it("no promociona una campaña activa sin productos visibles", async () => {
    setCampaignFixtures();
    loaders.products.mockResolvedValue([]);
    showPage("/catalogo?campaign=vigente");
    expect(await screen.findByText("No encontramos productos en esta selección.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Vigente" })).not.toBeInTheDocument();
    expect(screen.getByTestId("location")).not.toHaveTextContent("campaign=");
  });
});

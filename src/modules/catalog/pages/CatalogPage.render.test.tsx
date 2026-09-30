import {
  render,
  screen,
  within,
} from "@testing-library/react";

import { MemoryRouter } from "react-router-dom";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("@/integrations/sheets/fetchSheets", () => ({
  loadAllProducts: vi.fn().mockResolvedValue([
    {
      id: "GLE-001",
      title: "Ramo de rosas",
      description: "Un detalle especial",
      category: "para-enamorar",
      categories: [],
      subcategories: [],
      campaigns: ["hwd"],
      price: 85,
      offer_price: null,
      stock: 5,
      img: "",
      priority: 1,
      status: "Publicado",
      badges: ["premium"],
      attributes: [],
      addons: [],
    },
  ]),
  loadAllCampaigns: vi.fn().mockResolvedValue([
    {
      id: "hwd",
      name: "Hot Wheels Day",
      computedStatus: "activa",
      publicationStatus: "Publicado",
    },
  ]),
}));

import CatalogPage from "./CatalogPage";

describe("CatalogPage: Commerce Header H1", () => {
  it("monta la cabecera comercial aprobada", async () => {
    render(
      <MemoryRouter initialEntries={["/catalogo"]}>
        <CatalogPage />
      </MemoryRouter>,
    );

    const header =
      await screen.findByRole("banner");

    expect(
      within(header).getByRole(
        "heading",
        { level: 1 },
      ),
    ).toHaveAccessibleName("Gleemour");

    expect(
      within(header).getByRole(
        "navigation",
        { name: "Categorías" },
      ),
    ).toBeInTheDocument();

    expect(
      within(header).queryByRole(
        "group",
        { name: "Descubre" },
      ),
    ).not.toBeInTheDocument();

    const campaign =
      within(header).getByRole(
        "button",
        {
          name: "Campañas · Hot Wheels Day",
        },
      );

    expect(campaign).toHaveTextContent(
      "Hot Wheels Day",
    );

    expect(
      within(header).getByPlaceholderText(
        "Buscar producto, ocasión o código",
      ),
    ).toBeInTheDocument();

    expect(
      within(header).getByRole(
        "link",
        { name: /Inspírame/ },
      ),
    ).toHaveAttribute(
      "href",
      "/experiencia?origen=catalogo",
    );

    expect(
      within(header).getByRole(
        "button",
        { name: "Explorar" },
      ),
    ).toBeInTheDocument();

    for (const obsolete of [
      /Catálogo emocional/i,
      /^Catálogo$/,
      /Ramos, arreglos/i,
      /Detalles para emocionar/i,
      /Ayúdame a elegir/i,
      /Te ayudamos/i,
    ]) {
      expect(
        within(header).queryByText(obsolete),
      ).not.toBeInTheDocument();
    }

    expect(
      screen.getByRole(
        "button",
        { name: "Filtros" },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "combobox",
        { name: "Ordenar productos" },
      ),
    ).toHaveValue("featured");

    expect(
      screen.getByRole(
        "button",
        { name: /Consultar.*WhatsApp/i },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole(
        "button",
        { name: /Personalizar/i },
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByAltText("Ramo de rosas"),
    ).toHaveAttribute(
      "src",
      "/product-fallback.svg",
    );
  });
});

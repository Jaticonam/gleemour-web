import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";

import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { CatalogTopNav } from "./CatalogTopNav";

describe("CatalogTopNav Commerce Header H1", () => {
  it("separa marca, búsqueda, categorías y campaña", () => {
    const onCampaignSelect = vi.fn();

    render(
      <CatalogTopNav
        logoSlot={
          <img
            src="/logo.svg"
            alt="Gleemour"
          />
        }
        categoryItems={[
          {
            id: "todas",
            name: "Todos",
          },
          {
            id: "enamorar",
            name: "Para enamorar",
          },
        ]}
        activeCategory="todas"
        campaignItems={[
          {
            id: "hwd",
            name: "Hot Wheels Day",
          },
        ]}
        campaignCounts={{
          hwd: 8,
        }}
        onCampaignSelect={onCampaignSelect}
        searchSlot={
          <input
            aria-label="Buscar productos"
            placeholder="Buscar producto, ocasión o código"
          />
        }
        helpSlot={
          <a href="/experiencia?origen=catalogo">
            Inspírame
          </a>
        }
      />,
    );

    const header = screen.getByRole("banner");

    expect(
      within(header).getByRole(
        "heading",
        { level: 1 },
      ),
    ).toContainElement(
      screen.getByAltText("Gleemour"),
    );

    expect(
      within(header).getByRole(
        "textbox",
        { name: "Buscar productos" },
      ),
    ).toHaveAttribute(
      "placeholder",
      "Buscar producto, ocasión o código",
    );

    expect(
      within(header).getByRole(
        "navigation",
        { name: "Categorías" },
      ),
    ).toHaveTextContent("Para enamorar");

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

    expect(campaign).not.toHaveTextContent(
      "Campañas · Hot Wheels Day",
    );

    fireEvent.click(campaign);

    expect(
      onCampaignSelect,
    ).toHaveBeenCalledWith("hwd");
  });

  it("mantiene Descubre disponible dentro de Explorar", () => {
    const onDiscoverSelect = vi.fn();

    render(
      <CatalogTopNav
        campaignItems={[]}
        categoryItems={[
          {
            id: "todas",
            name: "Todos",
          },
        ]}
        discoverItems={[
          {
            id: "premium",
            name: "Premium",
          },
        ]}
        activeDiscover="premium"
        onDiscoverSelect={onDiscoverSelect}
      />,
    );

    expect(
      screen.queryByRole(
        "group",
        { name: "Descubre" },
      ),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole(
        "button",
        { name: "Explorar" },
      ),
    );

    const discover =
      screen.getByRole(
        "group",
        { name: "Descubre" },
      );

    expect(
      within(discover).getByRole(
        "button",
        { name: "Premium" },
      ),
    ).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(
      within(discover).getByRole(
        "button",
        { name: "Premium" },
      ),
    );

    expect(
      onDiscoverSelect,
    ).toHaveBeenCalledWith("");
  });

  it("abre el selector cuando existen múltiples campañas", () => {
    const onCampaignSelect = vi.fn();

    render(
      <CatalogTopNav
        categoryItems={[]}
        campaignItems={[
          {
            id: "hwd",
            name: "Hot Wheels Day",
          },
          {
            id: "flores",
            name: "Flores Amarillas",
          },
        ]}
        onCampaignSelect={onCampaignSelect}
      />,
    );

    fireEvent.click(
      screen.getByRole(
        "button",
        { name: "Campañas" },
      ),
    );

    expect(
      screen.getByRole(
        "dialog",
        {
          name: "Encuentra el detalle ideal",
        },
      ),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole(
        "button",
        { name: "Flores Amarillas" },
      ),
    );

    expect(
      onCampaignSelect,
    ).toHaveBeenCalledWith("flores");
  });

  it("cierra Explorar con Escape y restaura el foco", () => {
    render(
      <CatalogTopNav
        campaignItems={[]}
        categoryItems={[
          {
            id: "todas",
            name: "Todos",
          },
        ]}
      />,
    );

    const trigger =
      screen.getByRole(
        "button",
        { name: "Explorar" },
      );

    fireEvent.click(trigger);

    expect(
      screen.getByRole(
        "dialog",
        {
          name: "Encuentra el detalle ideal",
        },
      ),
    ).toBeInTheDocument();

    fireEvent.keyDown(
      document,
      { key: "Escape" },
    );

    expect(
      screen.queryByRole(
        "dialog",
        {
          name: "Encuentra el detalle ideal",
        },
      ),
    ).not.toBeInTheDocument();

    expect(trigger).toHaveFocus();
  });
});

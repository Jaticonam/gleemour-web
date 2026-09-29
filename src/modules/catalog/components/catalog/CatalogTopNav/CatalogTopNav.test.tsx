import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogTopNav } from "./CatalogTopNav";

describe("CatalogTopNav Descubre", () => {
  it("muestra solo opciones disponibles e indica selección accesible", () => {
    const onDiscoverSelect = vi.fn();
    render(
      <CatalogTopNav
        campaignItems={[]}
        categoryItems={[]}
        discoverItems={[{ id: "premium", name: "Premium" }]}
        activeDiscover="premium"
        onDiscoverSelect={onDiscoverSelect}
      />,
    );
    const discover = screen.getByRole("group", { name: "Descubre" });
    expect(within(discover).queryByRole("button", { name: "Nuevos" })).not.toBeInTheDocument();
    expect(within(discover).getByRole("button", { name: "Premium" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(discover).getByRole("button", { name: "Premium" }));
    fireEvent.click(within(discover).getByRole("button", { name: "Todos" }));
    expect(onDiscoverSelect).toHaveBeenNthCalledWith(1, "");
    expect(onDiscoverSelect).toHaveBeenNthCalledWith(2, "");
  });

  it("omite la sección cuando no hay datos comerciales elegibles", () => {
    render(<CatalogTopNav campaignItems={[]} categoryItems={[]} />);
    expect(screen.queryByRole("group", { name: "Descubre" })).not.toBeInTheDocument();
  });

  it("agrupa marca, categorías, Descubre, Campañas y búsqueda sin alterar selección", () => {
    const onCampaignSelect = vi.fn();
    render(<CatalogTopNav
      logoSlot={<img src="/logo.svg" alt="Gleemour" />}
      categoryItems={[{ id: "todas", name: "Todos" }]}
      activeCategory="todas"
      campaignItems={[{ id: "hwd", name: "Hot Wheels Day" }]}
      campaignCounts={{ hwd: 8 }}
      onCampaignSelect={onCampaignSelect}
      discoverItems={[{ id: "premium", name: "Premium" }]}
      searchSlot={<input aria-label="Buscar productos" />}
      helpSlot={<a href="/experiencia?origen=catalogo">Inspírame</a>}
    />);

    const header = screen.getByRole("banner");
    expect(within(header).getByRole("heading", { level: 1 })).toContainElement(screen.getByAltText("Gleemour"));
    expect(within(header).getByRole("navigation", { name: "Categorías" })).toHaveTextContent("Todos");
    const discovery = header.querySelector(".catalog-top-nav-discovery");
    expect(discovery).toContainElement(screen.getByRole("group", { name: "Descubre" }));
    expect(discovery).toContainElement(screen.getByRole("button", { name: /Hot Wheels Day/ }));
    expect(within(header).getByRole("textbox", { name: "Buscar productos" })).toBeInTheDocument();
    expect(within(header).getByRole("link", { name: "Inspírame" })).toHaveAttribute("href", "/experiencia?origen=catalogo");
    fireEvent.click(screen.getByRole("button", { name: /Hot Wheels Day/ }));
    expect(onCampaignSelect).toHaveBeenCalledWith("hwd");
  });

  it("mantiene categorías accesibles y cierra Explorar con Escape devolviendo el foco", () => {
    const onCategorySelect = vi.fn();
    render(<CatalogTopNav campaignItems={[]} categoryItems={[{ id: "todas", name: "Todos" }]}
      onCategorySelect={onCategorySelect} />);
    fireEvent.click(within(screen.getByRole("navigation", { name: "Categorías" })).getByRole("button", { name: "Todos" }));
    expect(onCategorySelect).toHaveBeenCalledWith("todas");
    const trigger = screen.getByRole("button", { name: "Explorar" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Encuentra el detalle ideal" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Encuentra el detalle ideal" })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });
});

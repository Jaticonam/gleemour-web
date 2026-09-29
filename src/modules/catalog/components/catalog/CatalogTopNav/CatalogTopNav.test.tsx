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

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
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminPage from "./AdminPage";

describe("AdminPage", () => {
  it("navega entre los tres módulos del workspace", () => {
    const loadProducts = vi.fn().mockResolvedValue([]);
    const loadCatalogData = vi.fn().mockResolvedValue({
      products: [],
      subcategories: [],
      campaigns: [],
    });

    render(
      <AdminPage
        loadAdminProducts={loadProducts}
        loadCatalogWorkspaceData={loadCatalogData}
      />,
    );

    expect(screen.getByRole("heading", { name: "Catálogo" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Catálogos" }));
    expect(screen.getByRole("heading", { name: "Catálogos" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cotizaciones" }));
    expect(screen.getByRole("heading", { name: "Cotizaciones" })).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { CatalogResultsToolbar } from "./CatalogResultsToolbar";
import { EMPTY_PURCHASE_FILTERS } from "@/modules/catalog/pages/CatalogFilters";

describe("CatalogResultsToolbar", () => {
  function Controlled() {
    const [filters, setFilters] = useState(EMPTY_PURCHASE_FILTERS);
    return <CatalogResultsToolbar title="Catálogo" count={5}
      filters={filters} onFiltersChange={setFilters}
      sort="featured" onSortChange={vi.fn()} subcategories={["Amor a distancia"]} />;
  }

  it("muestra contexto, contador real y orden actual", () => {
    const onSortChange = vi.fn();
    render(<CatalogResultsToolbar title="Para enamorar" count={1}
      filters={EMPTY_PURCHASE_FILTERS} onFiltersChange={vi.fn()}
      sort="featured" onSortChange={onSortChange} subcategories={[]} />);
    expect(screen.getByRole("heading", { name: "Para enamorar" })).toBeInTheDocument();
    expect(screen.getByText("1 producto")).toBeInTheDocument();
    expect(screen.queryByLabelText("Filtros de compra activos")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Ordenar productos" }), { target: { value: "price-asc" } });
    expect(onSortChange).toHaveBeenCalledWith("price-asc");
  });

  it("permite retirar cada filtro o limpiar solo los filtros de compra", () => {
    const onFiltersChange = vi.fn();
    const filters = {
      minPrice: "50", maxPrice: "100", availability: "available" as const,
      subcategory: "Amor a distancia",
    };
    render(<CatalogResultsToolbar title="Todos los detalles" count={0}
      filters={filters} onFiltersChange={onFiltersChange}
      sort="featured" onSortChange={vi.fn()} subcategories={["Amor a distancia"]} />);
    expect(screen.getByText("0 productos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtros · 3" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro de precio" }));
    expect(onFiltersChange).toHaveBeenCalledWith({ ...filters, minPrice: "", maxPrice: "" });
    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro de disponibilidad" }));
    expect(onFiltersChange).toHaveBeenCalledWith({ ...filters, availability: "all" });
    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro de subcategoría" }));
    expect(onFiltersChange).toHaveBeenCalledWith({ ...filters, subcategory: "" });
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(onFiltersChange).toHaveBeenCalledWith(EMPTY_PURCHASE_FILTERS);
  });

  it("abre un diálogo accesible, aplica filtros y cierra con Escape", async () => {
    render(<Controlled />);
    const trigger = screen.getByRole("button", { name: "Filtros" });
    fireEvent.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Filtrar productos" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.change(screen.getByRole("spinbutton", { name: "Desde" }), { target: { value: "50" } });
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(await screen.findByRole("button", { name: "Quitar filtro de precio" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { Product } from "@/shared/types/product";

import { ProductExplorer } from "./ProductExplorer";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "GLE-001",
    title: "Ramo Corazón",
    description: "Rosas premium",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: [],
    campaigns: [],
    price: 120,
    offer_price: null,
    stock: 3,
    img: "",
    images: [],
    priority: 10,
    status: "Publicado",
    badges: ["Premium"],
    attributes: [],
    addons: [],
    music: [],
    ...overrides,
  };
}

const PRODUCTS = [
  product(),
  product({
    id: "GLE-002",
    title: "Box Sorpresa",
    category: "para-sorprender",
    categories: ["para-sorprender"],
    status: "Borrador",
    stock: null,
  }),
  product({
    id: "GLE-003",
    title: "Ramo Sin Stock",
    stock: 0,
    status: "Agotado",
  }),
];

const loadControlledProducts = () => Promise.resolve(PRODUCTS);

function ControlledProductExplorer() {
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  return (
    <ProductExplorer
      loadProducts={loadControlledProducts}
      selectedProductIds={selectedProductIds}
      onSelectedProductIdsChange={setSelectedProductIds}
    />
  );
}

describe("ProductExplorer", () => {
  it("carga la fuente administrativa y muestra estados no públicos", async () => {
    const loadProducts = vi.fn().mockResolvedValue(PRODUCTS);

    render(<ProductExplorer loadProducts={loadProducts} />);

    expect(await screen.findByRole("heading", { name: "Ramo Corazón" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Box Sorpresa" })).toBeInTheDocument();
    expect(screen.getAllByText("Borrador")).toHaveLength(2);
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
    expect(loadProducts).toHaveBeenCalledTimes(1);
  });

  it("combina filtros y permite restablecerlos", async () => {
    render(<ProductExplorer loadProducts={() => Promise.resolve(PRODUCTS)} />);

    await screen.findByRole("heading", { name: "Ramo Corazón" });

    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "Borrador" },
    });

    expect(screen.queryByRole("heading", { name: "Ramo Corazón" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Box Sorpresa" })).toBeInTheDocument();
    expect(screen.getByText("1 de 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(screen.getByRole("heading", { name: "Ramo Corazón" })).toBeInTheDocument();
    expect(screen.getByText("3 de 3")).toBeInTheDocument();
  });

  it("informa errores y reintenta la carga", async () => {
    const loadProducts = vi
      .fn<() => Promise<Product[]>>()
      .mockRejectedValueOnce(new Error("Sheets no disponible"))
      .mockResolvedValueOnce(PRODUCTS);

    render(<ProductExplorer loadProducts={loadProducts} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Sheets no disponible");

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => {
      expect(loadProducts).toHaveBeenCalledTimes(2);
    });

    expect(await screen.findByRole("heading", { name: "Ramo Corazón" })).toBeInTheDocument();
  });

  it("selecciona productos y habilita el salto a Catalog Workspace", async () => {
    const loadProducts = vi.fn().mockResolvedValue(PRODUCTS);
    const changeSelection = vi.fn();
    const prepareCatalog = vi.fn();
    const prepareQuotation = vi.fn();
    const view = render(
      <ProductExplorer
        loadProducts={loadProducts}
        selectedProductIds={[]}
        onSelectedProductIdsChange={changeSelection}
        onPrepareCatalog={prepareCatalog}
        onPrepareQuotation={prepareQuotation}
      />,
    );

    await screen.findByRole("heading", { name: "Ramo Corazón" });
    expect(screen.getByRole("button", { name: "Preparar catálogo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cotizar selección" })).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Ramo Corazón" }));
    expect(changeSelection).toHaveBeenCalledWith(["GLE-001"]);

    view.rerender(
      <ProductExplorer
        loadProducts={loadProducts}
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={changeSelection}
        onPrepareCatalog={prepareCatalog}
        onPrepareQuotation={prepareQuotation}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Preparar catálogo" }));
    expect(prepareCatalog).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Cotizar selección" }));
    expect(prepareQuotation).toHaveBeenCalledTimes(1);
  });

  it("convierte las métricas en filtros rápidos removibles", async () => {
    render(<ProductExplorer loadProducts={() => Promise.resolve(PRODUCTS)} />);

    await screen.findByRole("heading", { name: "Ramo Corazón" });
    fireEvent.click(screen.getByRole("button", { name: /En preparación 1/ }));

    expect(screen.getByRole("heading", { name: "Box Sorpresa" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Ramo Corazón" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Quitar filtro En preparación" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Quitar filtro En preparación" }));
    fireEvent.click(screen.getByRole("button", { name: /Sin stock 1/ }));

    expect(screen.getByRole("heading", { name: "Ramo Sin Stock" })).toBeInTheDocument();
    expect(screen.getByText("1 de 3")).toBeInTheDocument();
  });

  it("mantiene la selección al filtrar, suma visibles y la limpia sin borrar filtros", async () => {
    render(<ControlledProductExplorer />);

    await screen.findByRole("heading", { name: "Ramo Corazón" });
    fireEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Ramo Corazón" }));
    expect(screen.getByText("1 seleccionados")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Estado"), {
      target: { value: "Borrador" },
    });
    expect(screen.getByText("1 seleccionados")).toBeInTheDocument();
    expect(screen.getByText("1 de 3")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Seleccionar visibles" }));
    expect(screen.getByText("2 seleccionados")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Buscar productos"), {
      target: { value: "Box" },
    });
    expect(screen.getByText("2 seleccionados")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar selección" }));
    expect(screen.getByText("0 seleccionados")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Box")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Borrador")).toBeInTheDocument();
  });

  it("abre una ficha lateral de solo lectura con datos reales", async () => {
    render(<ProductExplorer loadProducts={() => Promise.resolve(PRODUCTS)} />);

    await screen.findByRole("heading", { name: "Ramo Corazón" });
    fireEvent.click(screen.getAllByRole("button", { name: "Ver ficha" })[0]);

    const dialog = screen.getByRole("dialog", { name: "Ramo Corazón" });
    expect(dialog).toHaveTextContent("Solo lectura");
    expect(dialog).toHaveTextContent(/S\/\s120\.00/);
    expect(dialog).toHaveTextContent("3 unidades");
    expect(dialog).toHaveTextContent("Premium");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar ficha de producto" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

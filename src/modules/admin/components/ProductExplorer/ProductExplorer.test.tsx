import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
];

describe("ProductExplorer", () => {
  it("carga la fuente administrativa y muestra estados no públicos", async () => {
    const loadProducts = vi.fn().mockResolvedValue(PRODUCTS);

    render(<ProductExplorer loadProducts={loadProducts} />);

    expect(await screen.findByRole("heading", { name: "Ramo Corazón" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Box Sorpresa" })).toBeInTheDocument();
    expect(screen.getAllByText("Borrador")).toHaveLength(2);
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
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
    expect(screen.getByText("1 de 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));

    expect(screen.getByRole("heading", { name: "Ramo Corazón" })).toBeInTheDocument();
    expect(screen.getByText("2 de 2")).toBeInTheDocument();
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
    const view = render(
      <ProductExplorer
        loadProducts={loadProducts}
        selectedProductIds={[]}
        onSelectedProductIdsChange={changeSelection}
        onPrepareCatalog={prepareCatalog}
      />,
    );

    await screen.findByRole("heading", { name: "Ramo Corazón" });
    expect(screen.getByRole("button", { name: "Preparar catálogo" })).toBeDisabled();

    fireEvent.click(screen.getByRole("checkbox", { name: "Seleccionar Ramo Corazón" }));
    expect(changeSelection).toHaveBeenCalledWith(["GLE-001"]);

    view.rerender(
      <ProductExplorer
        loadProducts={loadProducts}
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={changeSelection}
        onPrepareCatalog={prepareCatalog}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Preparar catálogo" }));
    expect(prepareCatalog).toHaveBeenCalledTimes(1);
  });
});

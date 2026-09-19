import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type {
  Campaign,
  CatalogSubcategory,
  Product,
} from "@/shared/types/product";

import {
  CatalogWorkspace,
  type CatalogWorkspaceData,
} from "./CatalogWorkspace";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "GLE-001",
    title: "Ramo Aurora",
    description: "Rosas premium",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: ["te-elijo-hoy"],
    campaigns: ["san-valentin"],
    price: 120,
    offer_price: null,
    stock: 3,
    img: "",
    images: [],
    priority: 10,
    status: "Publicado",
    badges: [],
    attributes: [],
    addons: [],
    music: [],
    ...overrides,
  };
}

const SUBCATEGORIES: CatalogSubcategory[] = [
  {
    id: "te-elijo-hoy",
    categoryId: "para-enamorar",
    name: "Te elijo hoy",
    icon: "💘",
    description: "",
    priority: 10,
    status: "Publicado",
  },
];

const CAMPAIGNS: Campaign[] = [
  {
    id: "san-valentin",
    name: "San Valentín",
    icon: "💘",
    colorClass: "catalog-campaign-pink",
    startDate: "",
    endDate: "",
    priority: 10,
    showInCatalog: true,
    publicationStatus: "Publicado",
    computedStatus: "activa",
  },
];

const DATA: CatalogWorkspaceData = {
  products: [
    product(),
    product({ id: "GLE-002", title: "Box Corazón", priority: 20 }),
    product({ id: "GLE-003", title: "Borrador Interno", status: "Borrador" }),
  ],
  subcategories: SUBCATEGORIES,
  campaigns: CAMPAIGNS,
};

function renderWorkspace(
  overrides: Partial<React.ComponentProps<typeof CatalogWorkspace>> = {},
) {
  return render(
    <CatalogWorkspace
      selectedProductIds={[]}
      onSelectedProductIdsChange={() => undefined}
      onBackToProducts={() => undefined}
      loadData={() => Promise.resolve(DATA)}
      {...overrides}
    />,
  );
}

describe("CatalogWorkspace", () => {
  it("compone el catálogo completo y excluye borradores", async () => {
    renderWorkspace();

    expect(await screen.findByText("Box Corazón")).toBeInTheDocument();
    expect(screen.getByText("Ramo Aurora")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Subir Borrador Interno" }))
      .not.toBeInTheDocument();

    fireEvent.click(screen.getByText("1 producto excluido por estado"));
    expect(screen.getByText("Borrador Interno")).toBeInTheDocument();
  });

  it("usa la selección personalizada, permite ordenar y abre preview", async () => {
    renderWorkspace({ selectedProductIds: ["GLE-001", "GLE-002"] });

    expect(await screen.findByText("2 productos seleccionados")).toBeInTheDocument();

    const list = screen.getByRole("heading", { name: "Productos incluidos" })
      .closest("section");
    expect(list).not.toBeNull();

    const rowsBefore = within(list as HTMLElement).getAllByRole("article");
    expect(rowsBefore[0]).toHaveTextContent("Box Corazón");

    fireEvent.click(screen.getByRole("button", { name: "Subir Ramo Aurora" }));

    const rowsAfter = within(list as HTMLElement).getAllByRole("article");
    expect(rowsAfter[0]).toHaveTextContent("Ramo Aurora");

    fireEvent.click(screen.getByRole("button", { name: "Vista previa" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Catálogo Gleemour");
    expect(screen.getByRole("dialog")).toHaveTextContent("2 productos listos");
  });

  it("informa errores y reintenta las tres fuentes", async () => {
    const loadData = vi
      .fn<() => Promise<CatalogWorkspaceData>>()
      .mockRejectedValueOnce(new Error("Campañas no disponibles"))
      .mockResolvedValueOnce(DATA);

    renderWorkspace({ loadData });

    expect(await screen.findByRole("alert")).toHaveTextContent("Campañas no disponibles");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => expect(loadData).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Ramo Aurora")).toBeInTheDocument();
  });
});

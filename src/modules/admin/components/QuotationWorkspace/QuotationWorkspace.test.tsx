import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { QuotationDraft } from "@/application/admin/QuotationComposition";
import type { QuotationDocumentPort } from "@/application/admin/QuotationPublishing";
import type { QuotationDraftStore } from "@/infrastructure/admin/QuotationDraftStore";
import type { Product } from "@/shared/types/product";

import { QuotationWorkspace } from "./QuotationWorkspace";

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "GLE-001",
    title: "Ramo Aurora",
    description: "Rosas premium",
    category: "para-enamorar",
    categories: ["para-enamorar"],
    subcategories: [],
    campaigns: [],
    price: 120,
    offer_price: 99.9,
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

function draftStore(): QuotationDraftStore {
  let drafts: QuotationDraft[] = [];
  return {
    list: () => drafts,
    save: (draft) => {
      drafts = [draft, ...drafts.filter((item) => item.id !== draft.id)];
      return drafts;
    },
  };
}

const NOW = () => new Date(2026, 8, 19, 10, 30, 0);

describe("QuotationWorkspace", () => {
  it("edita líneas, calcula totales y guarda un borrador local", async () => {
    render(
      <QuotationWorkspace
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={() => undefined}
        onBackToProducts={() => undefined}
        loadProducts={() => Promise.resolve([product()])}
        draftStore={draftStore()}
        now={NOW}
      />,
    );

    expect(await screen.findByText("Ramo Aurora")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Cantidad"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText("Nombre del cliente *"), {
      target: { value: "Cliente Demo" },
    });
    fireEvent.change(screen.getByLabelText("WhatsApp *"), {
      target: { value: "00000000" },
    });

    expect(screen.getAllByText("S/ 199.80")).toHaveLength(2);
    expect(screen.getByText("Cotización preparada")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));
    expect(screen.getByRole("status")).toHaveTextContent("Borrador guardado");
    expect(screen.getByText("Cliente Demo")).toBeInTheDocument();
  });

  it("publica el PDF por el port de JUNG CORE y lo adjunta a WhatsApp", async () => {
    const publish = vi.fn<QuotationDocumentPort["publish"]>().mockResolvedValue({
      status: "ready",
      publicationId: "publication-1",
      publicUrl: "https://media.jungnegocios.com/quotations/GLQ-1",
      pdf: {
        assetId: "pdf-1",
        kind: "pdf",
        status: "ready",
        url: "https://media.jungnegocios.com/quotations/GLQ-1.pdf",
        mimeType: "application/pdf",
        version: "1",
      },
      publishedAt: "2026-09-19T15:00:00.000Z",
    });
    const openExternal = vi.fn();

    render(
      <QuotationWorkspace
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={() => undefined}
        onBackToProducts={() => undefined}
        loadProducts={() => Promise.resolve([product()])}
        draftStore={draftStore()}
        now={NOW}
        documentPort={{ publish }}
        openExternal={openExternal}
      />,
    );

    await screen.findByText("Ramo Aurora");
    fireEvent.change(screen.getByLabelText("Nombre del cliente *"), {
      target: { value: "Cliente Demo" },
    });
    fireEvent.change(screen.getByLabelText("WhatsApp *"), {
      target: { value: "00000000" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Generar PDF" }));
    await waitFor(() => expect(publish).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("link", { name: /Abrir PDF/ })).toHaveAttribute(
      "href",
      "https://media.jungnegocios.com/quotations/GLQ-1.pdf",
    );

    fireEvent.click(screen.getByRole("button", { name: "Enviar por WhatsApp" }));
    expect(openExternal).toHaveBeenCalledWith(
      expect.stringContaining("https://wa.me/00000000?text="),
    );
    expect(decodeURIComponent(openExternal.mock.calls[0][0])).toContain(
      "https://media.jungnegocios.com/quotations/GLQ-1",
    );

    fireEvent.change(screen.getByLabelText("Notas comerciales"), {
      target: { value: "Nueva condición" },
    });
    expect(screen.queryByRole("link", { name: /Abrir PDF/ })).not.toBeInTheDocument();
  });

  it("mantiene las salidas bloqueadas hasta completar la cotización", async () => {
    render(
      <QuotationWorkspace
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={() => undefined}
        onBackToProducts={() => undefined}
        loadProducts={() => Promise.resolve([product()])}
        draftStore={draftStore()}
        now={NOW}
      />,
    );

    await screen.findByText("Ramo Aurora");
    expect(screen.getByRole("button", { name: "Enviar por WhatsApp" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Generar PDF" })).toBeDisabled();
    expect(screen.getByText(/PDF vía JUNG CORE/)).toBeInTheDocument();
  });

  it("expone unavailable sin fabricar un enlace PDF", async () => {
    const publish = vi.fn<QuotationDocumentPort["publish"]>().mockResolvedValue({
      status: "unavailable",
      code: "JUNG_CORE_NOT_CONFIGURED",
      message: "JUNG CORE aún no está configurado.",
    });

    render(
      <QuotationWorkspace
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={() => undefined}
        onBackToProducts={() => undefined}
        loadProducts={() => Promise.resolve([product()])}
        draftStore={draftStore()}
        now={NOW}
        documentPort={{ publish }}
      />,
    );

    await screen.findByText("Ramo Aurora");
    fireEvent.change(screen.getByLabelText("Nombre del cliente *"), {
      target: { value: "Cliente Demo" },
    });
    fireEvent.change(screen.getByLabelText("WhatsApp *"), {
      target: { value: "00000000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generar PDF" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "JUNG CORE aún no está configurado",
    );
    expect(screen.queryByRole("link", { name: /Abrir PDF/ })).not.toBeInTheDocument();
  });

  it("informa errores y reintenta la fuente administrativa", async () => {
    const loadProducts = vi
      .fn<() => Promise<Product[]>>()
      .mockRejectedValueOnce(new Error("Sheets no disponible"))
      .mockResolvedValueOnce([product()]);

    render(
      <QuotationWorkspace
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={() => undefined}
        onBackToProducts={() => undefined}
        loadProducts={loadProducts}
        draftStore={draftStore()}
        now={NOW}
      />,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Sheets no disponible");
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => expect(loadProducts).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Ramo Aurora")).toBeInTheDocument();
  });

  it("retira una línea sin mutar ProductSelection y protege cambios sin guardar", async () => {
    const onSelectedProductIdsChange = vi.fn();
    const onBackToProducts = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(
      <QuotationWorkspace
        selectedProductIds={["GLE-001"]}
        onSelectedProductIdsChange={onSelectedProductIdsChange}
        onBackToProducts={onBackToProducts}
        loadProducts={() => Promise.resolve([product()])}
        draftStore={draftStore()}
        now={NOW}
      />,
    );

    await screen.findByText("Ramo Aurora");
    fireEvent.change(screen.getByLabelText("Cantidad"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "Product Explorer" }));
    expect(confirm).toHaveBeenCalled();
    expect(onBackToProducts).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Quitar Ramo Aurora" }));
    expect(screen.getByText("No hay productos en la cotización")).toBeInTheDocument();
    expect(onSelectedProductIdsChange).not.toHaveBeenCalled();
    confirm.mockRestore();
  });
});

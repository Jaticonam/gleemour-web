import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CatalogCommercialComposition } from "@/application/admin/AdminCommercialComposition";
import { createCatalogCompositionDraft, type CatalogCompositionResult } from "@/application/admin/CatalogComposition";
import type { CatalogImageRenderer } from "@/application/admin/CatalogImageOutput";
import type { Product } from "@/shared/types/product";

import { CatalogImageOutputControl } from "./CatalogImageOutputControl";

const createUrl = vi.fn(() => "blob:catalog-preview");
const revokeUrl = vi.fn();
Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createUrl });
Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeUrl });

const product = { id: "GLE-001", title: "Ramo Aurora", img: "", price: 89, offer_price: null, stock: 2 } as Product;
function result(included: Product[]): CatalogCompositionResult {
  return { candidates: included, included, automaticExcluded: [], manuallyExcluded: [], excluded: [] };
}

afterEach(() => { vi.clearAllMocks(); });

describe("CatalogImageOutputControl", () => {
  it("genera la composición real y ofrece el JPEG local sin publicar", async () => {
    const renderer: CatalogImageRenderer = {
      render: vi.fn(async (composition: CatalogCommercialComposition) => {
        expect(composition.payload.products).toEqual([expect.objectContaining({ productCode: "GLE-001", price: 89 })]);
        expect(composition.payload.catalog.composition.order).toEqual(["GLE-001"]);
        return {
          bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]),
          filename: "gleemour-catalog-page-01.jpg" as const,
          mimeType: "image/jpeg" as const,
          width: 1080, height: 1440,
          checksumSha256: "a".repeat(64),
          warnings: [],
        };
      }),
    };
    const draft = createCatalogCompositionDraft();
    const { rerender, unmount } = render(
      <CatalogImageOutputControl draft={draft} composition={result([product])} renderer={renderer} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Generar imagen" }));
    const download = await screen.findByRole("link", { name: "Descargar JPEG" });
    expect(download).toHaveAttribute("href", "blob:catalog-preview");
    expect(download).toHaveAttribute("download", "gleemour-catalog-page-01.jpg");
    expect(createUrl).toHaveBeenCalledTimes(1);

    rerender(<CatalogImageOutputControl draft={{ ...draft, settings: { title: "Otra composición" } }} composition={result([product])} renderer={renderer} />);
    await waitFor(() => expect(screen.queryByRole("link", { name: "Descargar JPEG" })).not.toBeInTheDocument());
    expect(revokeUrl).toHaveBeenCalledWith("blob:catalog-preview");
    unmount();
  });

  it("exige entre uno y seis productos", () => {
    const renderer: CatalogImageRenderer = { render: vi.fn() };
    const draft = createCatalogCompositionDraft();
    const { rerender } = render(<CatalogImageOutputControl draft={draft} composition={result([])} renderer={renderer} />);
    expect(screen.getByRole("button", { name: "Generar imagen" })).toBeDisabled();
    rerender(<CatalogImageOutputControl draft={draft} composition={result(Array.from({ length: 7 }, (_, index) => ({ ...product, id: `GLE-${index}` })))} renderer={renderer} />);
    expect(screen.getByRole("status")).toHaveTextContent("hasta 6 productos");
    expect(screen.getByRole("button", { name: "Generar imagen" })).toBeDisabled();
    expect(renderer.render).not.toHaveBeenCalled();
  });
});

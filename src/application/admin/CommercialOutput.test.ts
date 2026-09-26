import { describe, expect, it, vi } from "vitest";

import {
  createCatalogCompositionDraft,
  createCatalogVersionSnapshot,
  resolveCatalogComposition,
  toCatalogDraftContract,
} from "./CatalogComposition";
import {
  createCatalogCommercialComposition,
  createQuotationCommercialComposition,
} from "./AdminCommercialComposition";
import {
  COMMERCIAL_OUTPUT_SCHEMA_VERSION,
  createCommercialOutputRequest,
  type CommercialOutputEngine,
  type CommercialOutputFormat,
} from "./CommercialOutput";
import {
  createQuotationDraft,
  createQuotationSnapshot,
} from "./QuotationComposition";
import type { Product } from "@/shared/types/product";

const formats: CommercialOutputFormat[] = ["pdf", "csv", "print", "image"];

function product(id: string): Product {
  return {
    id,
    title: `Producto ${id}`,
    description: "",
    price: 100,
    offer_price: 90,
    stock: 4,
    img: `https://example.com/${id}.jpg`,
    category: "flores",
    categories: ["flores"],
    subcategories: [],
    campaigns: [],
    priority: 1,
    status: "Publicado",
    updated_at: "2026-09-26",
  };
}

describe("CommercialOutput", () => {
  it.each(formats)("admite el formato %s sin contaminar la composición", (format) => {
    const quotation = createQuotationDraft([], [], new Date("2026-09-26T10:00:00Z"));
    const composition = createQuotationCommercialComposition(
      createQuotationSnapshot(quotation, new Date("2026-09-26T10:01:00Z")),
    );

    const request = createCommercialOutputRequest({
      requestId: `request:${format}`,
      appId: "gleemour",
      format,
      requestedAt: new Date("2026-09-26T10:02:00Z"),
      composition,
    });

    expect(request).toMatchObject({
      schemaVersion: COMMERCIAL_OUTPUT_SCHEMA_VERSION,
      format,
      composition: { compositionKind: "quotation" },
    });
    expect(request.options).toBeUndefined();
  });

  it("preserva options opcionales fuera de la composición", () => {
    const composition = createQuotationCommercialComposition(
      createQuotationSnapshot(
        createQuotationDraft([], [], new Date("2026-09-26T10:00:00Z")),
        new Date("2026-09-26T10:01:00Z"),
      ),
    );
    const request = createCommercialOutputRequest({
      requestId: "request:pdf",
      appId: "gleemour",
      format: "pdf",
      requestedAt: new Date("2026-09-26T10:02:00Z"),
      composition,
      options: { pageSize: "A4", cover: true },
    });

    expect(request.options).toEqual({ pageSize: "A4", cover: true });
    expect(request.composition).toBe(composition);
    expect(request.composition.payload).not.toHaveProperty("pageSize");
  });

  it("crea un snapshot de catálogo autosuficiente y respetando el orden", () => {
    const products = [product("A"), product("B")];
    const draft = createCatalogCompositionDraft(["A", "B"]);
    draft.orderedProductIds = ["B", "A"];
    const result = resolveCatalogComposition(products, draft);
    const version = createCatalogVersionSnapshot(
      toCatalogDraftContract(draft, result),
      { catalogId: "catalog:1", catalogVersionId: "catalog:1:v1", versionNumber: 1 },
      new Date("2026-09-26T10:00:00Z"),
    );

    const composition = createCatalogCommercialComposition(version, products);

    expect(composition.payload.products.map((item) => item.productId)).toEqual(["B", "A"]);
    products[1].title = "Mutado";
    version.settings.title = "Mutado";
    expect(composition.payload.products[0].name).toBe("Producto B");
    expect(composition.payload.catalog.settings.title).toBe("Catálogo Gleemour");
  });

  it("normaliza el resultado detrás de un engine provider-neutral", async () => {
    const generate = vi.fn().mockResolvedValue({
      status: "ready",
      publicationId: "publication:1",
      artifact: {
        artifactId: "artifact:1",
        format: "image",
        mimeType: "image/png",
        publicUrl: "https://example.com/output.png",
      },
      completedAt: "2026-09-26T10:03:00.000Z",
    });
    const engine: CommercialOutputEngine = { generate };
    const composition = createQuotationCommercialComposition(
      createQuotationSnapshot(
        createQuotationDraft([], [], new Date("2026-09-26T10:00:00Z")),
        new Date("2026-09-26T10:01:00Z"),
      ),
    );
    const request = createCommercialOutputRequest({
      requestId: "request:image",
      appId: "gleemour",
      format: "image",
      requestedAt: new Date("2026-09-26T10:02:00Z"),
      composition,
    });

    const result = await engine.generate(request);

    expect(result).toMatchObject({
      status: "ready",
      artifact: { format: "image", mimeType: "image/png" },
    });
    expect(generate).toHaveBeenCalledWith(request);
  });
});

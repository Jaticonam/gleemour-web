import { describe, expect, it } from "vitest";
import type { Product } from "@/shared/types/product";
import {
  catalogMetadata, OG_FALLBACK, productMetadata, productPublicPath, renderMetadataHtml,
} from "./publicMetadata";

const product: Product = {
  id: "GLE-001", title: "Rosas & música", description: "<p>Un detalle real & especial.</p>",
  category: "para-enamorar", categories: ["para-enamorar"], subcategories: [],
  price: 100, offer_price: 90, stock: 3, img: "https://media.example.com/rosa.jpg",
  status: "Publicado", priority: 1, badges: [], attributes: [], addons: [],
};

const index = `<html><head><title>Home</title>
<meta name="description" content="Home" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://gleemour.com/" />
<meta property="og:title" content="Home" />
<meta property="og:image" content="https://gleemour.com/og/home.jpg" />
<meta name="twitter:title" content="Home" />
</head><body><div id="root"></div></body></html>`;

describe("SEO HTML estático", () => {
  it("da al catálogo un canonical estable y reemplaza metadata heredada", () => {
    const html = renderMetadataHtml(index, catalogMetadata);
    expect(html).toContain('rel="canonical" href="https://gleemour.com/catalogo"');
    expect(html).toContain(`content="${catalogMetadata.title}"`);
    expect(html.match(/property="og:title"/g)).toHaveLength(1);
    expect(html).not.toContain("<title>Home</title>");
    expect(html).toContain('<div id="root"></div>');
  });

  it("genera una ficha de producto pública con imagen real y contenido escapado", () => {
    const meta = productMetadata(product);
    const html = renderMetadataHtml(index, meta);
    expect(productPublicPath(product.id)).toBe("/catalogo/p/GLE-001.html");
    expect(meta.url).toBe("https://gleemour.com/catalogo/p/GLE-001.html");
    expect(html).toContain('content="Rosas &amp; música | Gleemour"');
    expect(html).toContain('content="Un detalle real &amp; especial."');
    expect(html).toContain('content="https://media.example.com/rosa.jpg"');
    expect(html).toContain('property="og:url" content="https://gleemour.com/catalogo/p/GLE-001.html"');
  });

  it("usa fallback controlado y no indexa aliases antiguos", () => {
    const meta = productMetadata({ ...product, img: "", description: "" });
    expect(meta.image).toBe(OG_FALLBACK);
    expect(meta.description).toContain("Gleemour");
    const alias = renderMetadataHtml(index, { ...catalogMetadata, robots: "noindex, follow" });
    expect(alias).toContain('name="robots" content="noindex, follow"');
  });
});

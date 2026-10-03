import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { loadAllProducts } from "../src/integrations/sheets/fetchSheets";
import {
  catalogMetadata,
  productMetadata,
  productPublicPath,
  renderMetadataHtml,
} from "../src/seo/publicMetadata";

async function main() {
  const dist = resolve("dist");
  const index = await readFile(resolve(dist, "index.html"), "utf8");
  const products = await loadAllProducts();
  if (products.length === 0) throw new Error("SEO: la fuente pública no entregó productos");

  const catalogDir = resolve(dist, "catalogo");
  const productDir = resolve(catalogDir, "p");
  await mkdir(productDir, { recursive: true });
  await writeFile(resolve(catalogDir, "index.html"), renderMetadataHtml(index, catalogMetadata));

  for (const product of products) {
    const relative = productPublicPath(product.id).replace(/^\//, "");
    await writeFile(resolve(dist, relative), renderMetadataHtml(index, productMetadata(product)));
  }

  // URLs anteriores continúan funcionando en React, pero no se indexan como otra ficha.
  await writeFile(resolve(catalogDir, "producto.html"), renderMetadataHtml(index, {
    ...catalogMetadata,
    title: "Detalle de producto | Gleemour",
    robots: "noindex, follow",
  }));
  await writeFile(resolve(catalogDir, "categoria.html"), renderMetadataHtml(index, {
    ...catalogMetadata,
    robots: "noindex, follow",
  }));
  console.info(`SEO: catálogo y ${products.length} productos públicos generados`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

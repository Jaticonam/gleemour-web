import type { CatalogCommercialComposition } from "@/application/admin/AdminCommercialComposition";
import {
  CatalogImageOutputError, GLEEMOUR_CATALOG_IMAGE_PRESET,
  type CatalogImageArtifact, type CatalogImagePreset, type CatalogImageRenderer,
  type CatalogImageWarning,
} from "@/application/admin/CatalogImageOutput";

export interface ImageResolver { resolve(url: string): Promise<CanvasImageSource>; }
export type CanvasFactory = (width: number, height: number) => HTMLCanvasElement;
export type CanvasEncoder = (canvas: HTMLCanvasElement, preset: Readonly<CatalogImagePreset>) => Promise<Uint8Array>;
const DEFAULT_ASSET_TIMEOUT_MS = 8_000;

function loadImage(url: string, timeoutMs = DEFAULT_ASSET_TIMEOUT_MS): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timeout = window.setTimeout(() => { image.src = ""; reject(new Error(`Timeout al cargar ${url}`)); }, timeoutMs);
    image.crossOrigin = "anonymous";
    image.onload = () => { window.clearTimeout(timeout); resolve(image); };
    image.onerror = () => { window.clearTimeout(timeout); reject(new Error(`No se pudo cargar ${url}`)); };
    image.src = url;
  });
}

export const browserImageResolver: ImageResolver = { resolve: loadImage };
const browserCanvasFactory: CanvasFactory = (width, height) => {
  const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height; return canvas;
};

function canvasToBytes(canvas: HTMLCanvasElement, preset: Readonly<CatalogImagePreset>): Promise<Uint8Array> {
  return new Promise((resolve, reject) => canvas.toBlob(async (blob) => {
    if (!blob) { reject(new CatalogImageOutputError("RENDER_FAILED", "Canvas no produjo un archivo JPEG.")); return; }
    resolve(new Uint8Array(await blob.arrayBuffer()));
  }, preset.mimeType, preset.quality));
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const stable = new Uint8Array(bytes);
  const digest = await crypto.subtle.digest("SHA-256", stable.buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function dimensions(image: CanvasImageSource) {
  if (image instanceof HTMLImageElement) return { width: image.naturalWidth, height: image.naturalHeight };
  return { width: Number(image.width), height: Number(image.height) };
}

function drawCover(context: CanvasRenderingContext2D, image: CanvasImageSource, x: number, y: number, width: number, height: number) {
  const source = dimensions(image); const scale = Math.max(width / source.width, height / source.height);
  const sourceWidth = width / scale; const sourceHeight = height / scale;
  context.drawImage(image, (source.width - sourceWidth) / 2, (source.height - sourceHeight) / 2, sourceWidth, sourceHeight, x, y, width, height);
}

function drawFallback(context: CanvasRenderingContext2D, productCode: string, x: number, y: number, width: number, height: number) {
  context.fillStyle = "#f6eef5"; context.fillRect(x, y, width, height);
  context.fillStyle = "#9a8bba"; context.beginPath(); context.arc(x + width / 2, y + height / 2 - 16, 54, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#6a5a8a"; context.font = "700 22px Arial, sans-serif"; context.textAlign = "center";
  context.fillText(productCode, x + width / 2, y + height / 2 + 76); context.textAlign = "start";
}

function money(value: number) {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(value);
}

function validatePreset(preset: Readonly<CatalogImagePreset>) {
  if (preset.id !== GLEEMOUR_CATALOG_IMAGE_PRESET.id || preset.version !== 1 || preset.width !== 1080 || preset.height !== 1440 || preset.mimeType !== "image/jpeg" || preset.maxProducts !== 6) {
    throw new CatalogImageOutputError("INVALID_PRESET", "M9B.1 solo admite el preset gleemour-catalog-page-v1.");
  }
}

export class CanvasCatalogImageRenderer implements CatalogImageRenderer {
  constructor(
    private readonly imageResolver: ImageResolver = browserImageResolver,
    private readonly canvasFactory: CanvasFactory = browserCanvasFactory,
    private readonly canvasEncoder: CanvasEncoder = canvasToBytes,
  ) {}

  async render(composition: CatalogCommercialComposition, preset: Readonly<CatalogImagePreset> = GLEEMOUR_CATALOG_IMAGE_PRESET): Promise<CatalogImageArtifact> {
    validatePreset(preset);
    const products = composition.payload.products;
    if (!products.length) throw new CatalogImageOutputError("INVALID_COMPOSITION", "El catálogo no contiene productos publicables.");
    if (products.length > preset.maxProducts) throw new CatalogImageOutputError("TOO_MANY_PRODUCTS", `El preset admite un máximo de ${preset.maxProducts} productos por página.`);
    const resolvedImages = await Promise.all(products.map(async (product) => {
      try {
        if (!product.imageUrl) throw new Error("URL de imagen vacía");
        return { image: await this.imageResolver.resolve(product.imageUrl), warning: undefined };
      } catch (cause) {
        const warning: CatalogImageWarning = { code: "ASSET_FALLBACK", productCode: product.productCode, message: cause instanceof Error ? cause.message : "Imagen inválida" };
        return { image: null, warning };
      }
    }));
    const canvas = this.canvasFactory(preset.width, preset.height); const context = canvas.getContext("2d");
    if (!context) throw new CatalogImageOutputError("RENDER_FAILED", "Canvas 2D no está disponible.");
    context.fillStyle = "#fdfbf7"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#6a5a8a"; context.fillRect(0, 0, canvas.width, 204);
    context.fillStyle = "#ffffff"; context.font = "700 58px Georgia, serif"; context.fillText("GLEEMOUR", 64, 86);
    context.font = "500 34px Arial, sans-serif"; context.fillText(composition.payload.catalog.settings.title.slice(0, 42), 64, 151);
    const cardWidth = 446; const cardHeight = 360; const gapX = 60; const gapY = 30; const startX = 64; const startY = 236;
    products.forEach((product, index) => {
      const x = startX + (index % 2) * (cardWidth + gapX); const y = startY + Math.floor(index / 2) * (cardHeight + gapY);
      context.fillStyle = "#ffffff"; context.fillRect(x, y, cardWidth, cardHeight);
      const resolved = resolvedImages[index];
      if (resolved.image) drawCover(context, resolved.image, x, y, cardWidth, 244); else drawFallback(context, product.productCode, x, y, cardWidth, 244);
      context.fillStyle = "#372c3f"; context.font = "600 25px Arial, sans-serif"; context.fillText(product.name.slice(0, 31), x + 20, y + 284);
      context.fillStyle = "#6a5a8a"; context.font = "700 28px Arial, sans-serif"; context.fillText(money(product.offerPrice ?? product.price), x + 20, y + 328);
      if (product.offerPrice !== null) { context.fillStyle = "#8b8290"; context.font = "500 19px Arial, sans-serif"; context.fillText(`Antes ${money(product.price)}`, x + 212, y + 327); }
    });
    const bytes = await this.canvasEncoder(canvas, preset);
    return { bytes, filename: "gleemour-catalog-page-01.jpg", mimeType: preset.mimeType, width: canvas.width, height: canvas.height, checksumSha256: await sha256(bytes), warnings: resolvedImages.flatMap((resolved) => resolved.warning ? [resolved.warning] : []) };
  }
}

import type { Product } from "@/shared/types/product";

import {
  GLEEMOUR_BRAND_ASSET_URLS,
} from "@/tenant/assets/publicAssets";

export const SITE_URL = "https://gleemour.com";

/**
 * Transitional fallback until JUNG Media publishes
 * the canonical social-og-v1 asset.
 */
export const OG_FALLBACK =
  GLEEMOUR_BRAND_ASSET_URLS.logoPrimary;

export interface PageMetadata {
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  robots?: string;
}

export const catalogMetadata: PageMetadata = {
  title: "Catálogo de flores y detalles | Gleemour",
  description: "Explora arreglos florales y detalles Gleemour para enamorar, celebrar, agradecer y sorprender en Tacna.",
  url: `${SITE_URL}/catalogo`,
  image: OG_FALLBACK,
  imageAlt: "Gleemour, flores y detalles emocionales",
};

export const homeMetadata: PageMetadata = {
  title: "Flores y regalos emocionales en Tacna | Gleemour",
  description: "Flores y regalos emocionales en Tacna. Arreglos florales y detalles personalizados para momentos especiales.",
  url: `${SITE_URL}/`,
  image: OG_FALLBACK,
  imageAlt: catalogMetadata.imageAlt,
};

export const unavailableProductMetadata: PageMetadata = {
  ...catalogMetadata,
  title: "Producto no disponible | Gleemour",
  robots: "noindex, follow",
};

export function productPublicPath(id: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new Error(`Código de producto no compatible con URL pública: ${id}`);
  }
  return `/catalogo/p/${id}.html`;
}

export function productMetadata(product: Product): PageMetadata {
  const image = product.img.trim();
  const publicImage = /^https:\/\/[^\s]+$/i.test(image) ? image : OG_FALLBACK;
  const description = product.description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
  return {
    title: `${product.title} | Gleemour`,
    description: description || "Conoce este detalle de Gleemour y consulta su disponibilidad por WhatsApp.",
    url: `${SITE_URL}${productPublicPath(product.id)}`,
    image: publicImage,
    imageAlt: publicImage === OG_FALLBACK ? catalogMetadata.imageAlt : product.title,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Inserta metadata en el HTML ya transformado por Vite, legible sin ejecutar JS. */
export function renderMetadataHtml(index: string, meta: PageMetadata): string {
  const canonical = escapeHtml(meta.url);
  const description = escapeHtml(meta.description);
  const title = escapeHtml(meta.title);
  const image = escapeHtml(meta.image);
  const imageAlt = escapeHtml(meta.imageAlt);
  const remove = /<title>[\s\S]*?<\/title>|<link\s+[^>]*rel="canonical"[^>]*\/>|<meta\s+[^>]*(?:name="(?:description|robots|googlebot|twitter:[^"]+)"|property="og:[^"]+")[^>]*\/>/gi;
  const head = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="${meta.robots ?? "index, follow"}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:locale" content="es_PE" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Gleemour" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:alt" content="${imageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  `;
  return index.replace(remove, "").replace("</head>", `${head}</head>`);
}

/** Sincroniza el head durante navegación SPA; el HTML estático sigue siendo la fuente para crawlers. */
export function applyPageMetadata(meta: PageMetadata): void {
  document.title = meta.title;
  const setMeta = (selector: string, attribute: "name" | "property", key: string, value: string) => {
    let tag = document.head.querySelector<HTMLMetaElement>(selector);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attribute, key);
      document.head.append(tag);
    }
    tag.content = value;
  };
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = meta.url;
  setMeta('meta[name="description"]', "name", "description", meta.description);
  setMeta('meta[name="robots"]', "name", "robots", meta.robots ?? "index, follow");
  for (const [key, value] of Object.entries({
    "og:type": "website", "og:url": meta.url, "og:title": meta.title,
    "og:description": meta.description, "og:image": meta.image, "og:image:alt": meta.imageAlt,
  })) setMeta(`meta[property="${key}"]`, "property", key, value);
  for (const [key, value] of Object.entries({
    "twitter:card": "summary_large_image", "twitter:title": meta.title,
    "twitter:description": meta.description, "twitter:image": meta.image,
  })) setMeta(`meta[name="${key}"]`, "name", key, value);
}

import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
} from "@/application/publicAssets/PublicAssetContract";

import {
  resolveGleemourPublicAsset,
  resolveGleemourSocialAsset,
} from "@/app/publicAssets/GleemourPublicAssets";

import type {
  GleemourSocialAssetInput,
} from "@/app/publicAssets/GleemourPublicAssets";

import type {
  Product,
} from "@/shared/types/product";

import {
  GLEEMOUR_BRAND_ASSET_URLS,
  GLEEMOUR_SOCIAL_OG_PRESET,
} from "@/tenant/assets/publicAssets";

export const SITE_URL =
  "https://gleemour.com";

export const OG_FALLBACK =
  GLEEMOUR_BRAND_ASSET_URLS.logoPrimary;

const CATALOG_TITLE =
  "Catálogo de flores y detalles | Gleemour";

const CATALOG_DESCRIPTION =
  "Explora arreglos florales y detalles Gleemour para enamorar, celebrar, agradecer y sorprender en Tacna.";

const DEFAULT_IMAGE_ALT =
  "Gleemour, flores y detalles emocionales";

export interface PageMetadata {
  title: string;
  description: string;
  url: string;

  image: string;
  imageAlt: string;

  imageMimeType?: string;
  imageWidth?: number;
  imageHeight?: number;

  robots?: string;
}

interface MetadataImage {
  image: string;
  imageAlt: string;
  imageMimeType?: string;
  imageWidth?: number;
  imageHeight?: number;
}

export interface CategoryMetadataInput {
  id: string;
  name: string;
  description?: string;
}

export interface CampaignMetadataInput {
  id: string;
  name: string;
}

function metadataImageFromAsset(
  asset: PublicAssetDescriptor | null,
  imageAlt: string,
): MetadataImage {
  if (!asset) {
    return {
      image: OG_FALLBACK,
      imageAlt: DEFAULT_IMAGE_ALT,
    };
  }

  return {
    image: asset.publicUrl,
    imageAlt,

    imageMimeType:
      asset.mimeType || undefined,

    imageWidth:
      asset.width,

    imageHeight:
      asset.height,
  };
}

function resolveSocialMetadataImage(
  input: GleemourSocialAssetInput,
  imageAlt: string,
  providers?:
    readonly PublicAssetProvider[],
): MetadataImage {
  return metadataImageFromAsset(
    resolveGleemourSocialAsset(
      input,
      providers,
    ),
    imageAlt,
  );
}

function resolveExactProductSocialAsset(
  productId: string,
  providers?:
    readonly PublicAssetProvider[],
): PublicAssetDescriptor | null {
  return resolveGleemourPublicAsset(
    {
      scope: "social",
      role: "og-product",
      entityType: "product",
      entityId: productId,
      preset:
        GLEEMOUR_SOCIAL_OG_PRESET.id,
    },
    providers,
  );
}

function resolveProductMetadataImage(
  product: Product,
  providers?:
    readonly PublicAssetProvider[],
): MetadataImage {
  const exactSocial =
    resolveExactProductSocialAsset(
      product.id,
      providers,
    );

  if (exactSocial) {
    return metadataImageFromAsset(
      exactSocial,
      product.title,
    );
  }

  const productImage =
    product.img.trim();

  if (
    /^https:\/\/[^\s]+$/i.test(
      productImage,
    )
  ) {
    return {
      image: productImage,
      imageAlt: product.title,
    };
  }

  return resolveSocialMetadataImage(
    {
      role: "og-default",
    },
    DEFAULT_IMAGE_ALT,
    providers,
  );
}

export function catalogMetadata(
  providers?:
    readonly PublicAssetProvider[],
): PageMetadata {
  return {
    title: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    url: `${SITE_URL}/catalogo`,

    ...resolveSocialMetadataImage(
      {
        role: "og-default",
      },
      DEFAULT_IMAGE_ALT,
      providers,
    ),
  };
}

export function homeMetadata(
  providers?:
    readonly PublicAssetProvider[],
): PageMetadata {
  return {
    title:
      "Flores y regalos emocionales en Tacna | Gleemour",

    description:
      "Flores y regalos emocionales en Tacna. Arreglos florales y detalles personalizados para momentos especiales.",

    url: `${SITE_URL}/`,

    ...resolveSocialMetadataImage(
      {
        role: "og-default",
      },
      DEFAULT_IMAGE_ALT,
      providers,
    ),
  };
}

export function categoryMetadata(
  category: CategoryMetadataInput,
  providers?:
    readonly PublicAssetProvider[],
): PageMetadata {
  const id =
    category.id.trim();

  const name =
    category.name.trim() ||
    "Detalles especiales";

  return {
    title:
      `${name} | Gleemour`,

    description:
      category.description?.trim() ||
      CATALOG_DESCRIPTION,

    url:
      `${SITE_URL}/catalogo/categoria.html?cat=${encodeURIComponent(id)}`,

    robots:
      "noindex, follow",

    ...resolveSocialMetadataImage(
      {
        role: "og-category",
        entityType: "category",
        entityId: id,
      },
      `${name} | Gleemour`,
      providers,
    ),
  };
}

export function campaignMetadata(
  campaign: CampaignMetadataInput,
  providers?:
    readonly PublicAssetProvider[],
): PageMetadata {
  const id =
    campaign.id.trim();

  const name =
    campaign.name.trim() ||
    "Campaña Gleemour";

  return {
    title:
      `${name} | Gleemour`,

    description:
      `Descubre ${name} en Gleemour y encuentra detalles para sorprender en momentos especiales.`,

    url:
      `${SITE_URL}/catalogo?campaign=${encodeURIComponent(id)}`,

    robots:
      "noindex, follow",

    ...resolveSocialMetadataImage(
      {
        role: "og-campaign",
        entityType: "campaign",
        entityId: id,
      },
      `${name} | Gleemour`,
      providers,
    ),
  };
}

export function unavailableProductMetadata(
  providers?:
    readonly PublicAssetProvider[],
): PageMetadata {
  return {
    ...catalogMetadata(providers),
    title:
      "Producto no disponible | Gleemour",
    robots:
      "noindex, follow",
  };
}

export function productPublicPath(
  id: string,
): string {
  if (
    !/^[A-Za-z0-9_-]+$/.test(id)
  ) {
    throw new Error(
      `Código de producto no compatible con URL pública: ${id}`,
    );
  }

  return `/catalogo/p/${id}.html`;
}

export function productMetadata(
  product: Product,
  providers?:
    readonly PublicAssetProvider[],
): PageMetadata {
  const description =
    product.description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

  return {
    title:
      `${product.title} | Gleemour`,

    description:
      description ||
      "Conoce este detalle de Gleemour y consulta su disponibilidad por WhatsApp.",

    url:
      `${SITE_URL}${productPublicPath(product.id)}`,

    ...resolveProductMetadataImage(
      product,
      providers,
    ),
  };
}

function escapeHtml(
  value: string,
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderOptionalImageMetadata(
  meta: PageMetadata,
): string {
  const tags: string[] = [];

  if (meta.imageMimeType) {
    tags.push(
      `    <meta property="og:image:type" content="${escapeHtml(meta.imageMimeType)}" />`,
    );
  }

  if (meta.imageWidth) {
    tags.push(
      `    <meta property="og:image:width" content="${meta.imageWidth}" />`,
    );
  }

  if (meta.imageHeight) {
    tags.push(
      `    <meta property="og:image:height" content="${meta.imageHeight}" />`,
    );
  }

  return tags.length
    ? `${tags.join("\n")}\n`
    : "";
}

/**
 * Inserta metadata en el HTML ya transformado por Vite,
 * legible sin ejecutar JavaScript.
 */
export function renderMetadataHtml(
  index: string,
  meta: PageMetadata,
): string {
  const canonical =
    escapeHtml(meta.url);

  const description =
    escapeHtml(meta.description);

  const title =
    escapeHtml(meta.title);

  const image =
    escapeHtml(meta.image);

  const imageAlt =
    escapeHtml(meta.imageAlt);

  const remove =
    /<title>[\s\S]*?<\/title>|<link\s+[^>]*rel="canonical"[^>]*\/>|<meta\s+[^>]*(?:name="(?:description|robots|googlebot|twitter:[^"]+)"|property="og:[^"]+")[^>]*\/>/gi;

  const optionalImageMetadata =
    renderOptionalImageMetadata(meta);

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
${optionalImageMetadata}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${imageAlt}" />
  `;

  return index
    .replace(remove, "")
    .replace(
      "</head>",
      `${head}</head>`,
    );
}

function setMeta(
  selector: string,
  attribute: "name" | "property",
  key: string,
  value: string,
): void {
  let tag =
    document.head.querySelector<HTMLMetaElement>(
      selector,
    );

  if (!tag) {
    tag =
      document.createElement("meta");

    tag.setAttribute(
      attribute,
      key,
    );

    document.head.append(tag);
  }

  tag.content = value;
}

function setOptionalMeta(
  selector: string,
  attribute: "name" | "property",
  key: string,
  value:
    | string
    | number
    | undefined,
): void {
  if (
    value === undefined ||
    value === ""
  ) {
    document.head
      .querySelector(selector)
      ?.remove();

    return;
  }

  setMeta(
    selector,
    attribute,
    key,
    String(value),
  );
}

/**
 * Sincroniza el head durante navegación SPA.
 * El HTML estático continúa siendo la fuente para crawlers.
 */
export function applyPageMetadata(
  meta: PageMetadata,
): void {
  document.title =
    meta.title;

  let canonical =
    document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

  if (!canonical) {
    canonical =
      document.createElement("link");

    canonical.rel =
      "canonical";

    document.head.append(
      canonical,
    );
  }

  canonical.href =
    meta.url;

  setMeta(
    'meta[name="description"]',
    "name",
    "description",
    meta.description,
  );

  setMeta(
    'meta[name="robots"]',
    "name",
    "robots",
    meta.robots ??
      "index, follow",
  );

  const openGraph = {
    "og:type": "website",
    "og:url": meta.url,
    "og:title": meta.title,
    "og:description":
      meta.description,
    "og:image": meta.image,
    "og:image:alt":
      meta.imageAlt,
  };

  for (
    const [key, value]
    of Object.entries(openGraph)
  ) {
    setMeta(
      `meta[property="${key}"]`,
      "property",
      key,
      value,
    );
  }

  setOptionalMeta(
    'meta[property="og:image:type"]',
    "property",
    "og:image:type",
    meta.imageMimeType,
  );

  setOptionalMeta(
    'meta[property="og:image:width"]',
    "property",
    "og:image:width",
    meta.imageWidth,
  );

  setOptionalMeta(
    'meta[property="og:image:height"]',
    "property",
    "og:image:height",
    meta.imageHeight,
  );

  const twitter = {
    "twitter:card":
      "summary_large_image",

    "twitter:title":
      meta.title,

    "twitter:description":
      meta.description,

    "twitter:image":
      meta.image,

    "twitter:image:alt":
      meta.imageAlt,
  };

  for (
    const [key, value]
    of Object.entries(twitter)
  ) {
    setMeta(
      `meta[name="${key}"]`,
      "name",
      key,
      value,
    );
  }
}
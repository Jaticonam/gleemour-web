import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  PublicAssetDescriptor,
  PublicAssetProvider,
} from "@/application/publicAssets/PublicAssetContract";

import type {
  Product,
} from "@/shared/types/product";

import {
  GLEEMOUR_BRAND_ASSET_URLS,
} from "@/tenant/assets/publicAssets";

import {
  campaignMetadata,
  catalogMetadata,
  categoryMetadata,
  OG_FALLBACK,
  productMetadata,
  productPublicPath,
  renderMetadataHtml,
} from "./publicMetadata";

const product: Product = {
  id: "GLE-001",
  title: "Rosas & música",
  description:
    "<p>Un detalle real & especial.</p>",
  category: "para-enamorar",
  categories: ["para-enamorar"],
  subcategories: [],
  price: 100,
  offer_price: 90,
  stock: 3,
  img:
    "https://media.example.com/rosa.jpg",
  status: "Publicado",
  priority: 1,
  badges: [],
  attributes: [],
  addons: [],
};

const index =
  `<html><head><title>Home</title>
<meta name="description" content="Home" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://gleemour.com/" />
<meta property="og:title" content="Home" />
<meta property="og:image" content="https://gleemour.com/logo_color.png" />
<meta name="twitter:title" content="Home" />
</head><body><div id="root"></div></body></html>`;

function socialAsset(
  overrides:
    Partial<PublicAssetDescriptor> = {},
): PublicAssetDescriptor {
  return {
    assetId:
      "media:gleemour:og-default",

    app: "gleemour",
    scope: "social",
    role: "og-default",

    preset:
      "social-og-v1",

    publicUrl:
      "https://media.jung.test/gleemour/og/default.jpg",

    mimeType:
      "image/jpeg",

    width: 1200,
    height: 630,

    version: "v1",
    status: "ACTIVE",

    ...overrides,
  };
}

describe(
  "SEO HTML estático",
  () => {
    it(
      "mantiene el logo canonico como ultimo fallback",
      () => {
        expect(
          OG_FALLBACK,
        ).toBe(
          GLEEMOUR_BRAND_ASSET_URLS.logoPrimary,
        );

        expect(
          catalogMetadata().image,
        ).toBe(OG_FALLBACK);
      },
    );

    it(
      "consume og-default y propaga dimensiones del descriptor",
      () => {
        const asset =
          socialAsset();

        const provider:
          PublicAssetProvider = {
            resolve(request) {
              return request.role ===
                "og-default"
                ? asset
                : null;
            },
          };

        const meta =
          catalogMetadata(
            [provider],
          );

        expect(meta.image).toBe(
          asset.publicUrl,
        );

        expect(
          meta.imageMimeType,
        ).toBe("image/jpeg");

        expect(
          meta.imageWidth,
        ).toBe(1200);

        expect(
          meta.imageHeight,
        ).toBe(630);
      },
    );

    it(
      "solicita OG específico para categoría y campaña",
      () => {
        const categoryAsset =
          socialAsset({
            assetId:
              "media:category:enamorar",

            role:
              "og-category",

            entityType:
              "category",

            entityId:
              "para-enamorar",

            publicUrl:
              "https://media.jung.test/category.jpg",
          });

        const campaignAsset =
          socialAsset({
            assetId:
              "media:campaign:octubre",

            role:
              "og-campaign",

            entityType:
              "campaign",

            entityId:
              "octubre",

            publicUrl:
              "https://media.jung.test/campaign.jpg",
          });

        const provider:
          PublicAssetProvider = {
            resolve(request) {
              if (
                request.role ===
                "og-category"
              ) {
                return categoryAsset;
              }

              if (
                request.role ===
                "og-campaign"
              ) {
                return campaignAsset;
              }

              return null;
            },
          };

        expect(
          categoryMetadata(
            {
              id:
                "para-enamorar",

              name:
                "Para enamorar",
            },
            [provider],
          ).image,
        ).toBe(
          categoryAsset.publicUrl,
        );

        expect(
          campaignMetadata(
            {
              id: "octubre",
              name: "Octubre",
            },
            [provider],
          ).image,
        ).toBe(
          campaignAsset.publicUrl,
        );
      },
    );

    it(
      "prioriza og-product sobre la foto normal del producto",
      () => {
        const productAsset =
          socialAsset({
            assetId:
              "media:product:GLE-001",

            role:
              "og-product",

            entityType:
              "product",

            entityId:
              "GLE-001",

            publicUrl:
              "https://media.jung.test/product-og.jpg",
          });

        const provider:
          PublicAssetProvider = {
            resolve(request) {
              return request.role ===
                "og-product"
                ? productAsset
                : null;
            },
          };

        expect(
          productMetadata(
            product,
            [provider],
          ).image,
        ).toBe(
          productAsset.publicUrl,
        );
      },
    );

    it(
      "conserva foto pública del producto antes de degradar a og-default",
      () => {
        const defaultAsset =
          socialAsset();

        const provider:
          PublicAssetProvider = {
            resolve(request) {
              return request.role ===
                "og-default"
                ? defaultAsset
                : null;
            },
          };

        expect(
          productMetadata(
            product,
            [provider],
          ).image,
        ).toBe(product.img);
      },
    );

    it(
      "degrada producto sin foto pública hacia og-default",
      () => {
        const defaultAsset =
          socialAsset();

        const provider:
          PublicAssetProvider = {
            resolve(request) {
              return request.role ===
                "og-default"
                ? defaultAsset
                : null;
            },
          };

        const meta =
          productMetadata(
            {
              ...product,
              img: "/local.jpg",
            },
            [provider],
          );

        expect(meta.image).toBe(
          defaultAsset.publicUrl,
        );

        expect(
          meta.imageWidth,
        ).toBe(1200);
      },
    );

    it(
      "genera ficha pública y contenido escapado",
      () => {
        const meta =
          productMetadata(product);

        const html =
          renderMetadataHtml(
            index,
            meta,
          );

        expect(
          productPublicPath(
            product.id,
          ),
        ).toBe(
          "/catalogo/p/GLE-001.html",
        );

        expect(meta.url).toBe(
          "https://gleemour.com/catalogo/p/GLE-001.html",
        );

        expect(html).toContain(
          'content="Rosas &amp; música | Gleemour"',
        );

        expect(html).toContain(
          'content="Un detalle real &amp; especial."',
        );

        expect(html).toContain(
          'content="https://media.example.com/rosa.jpg"',
        );
      },
    );

    it(
      "renderiza metadatos técnicos cuando el asset los declara",
      () => {
        const asset =
          socialAsset();

        const provider:
          PublicAssetProvider = {
            resolve() {
              return asset;
            },
          };

        const html =
          renderMetadataHtml(
            index,
            catalogMetadata(
              [provider],
            ),
          );

        expect(html).toContain(
          'property="og:image:type" content="image/jpeg"',
        );

        expect(html).toContain(
          'property="og:image:width" content="1200"',
        );

        expect(html).toContain(
          'property="og:image:height" content="630"',
        );

        expect(html).toContain(
          'name="twitter:image:alt"',
        );
      },
    );
  },
);
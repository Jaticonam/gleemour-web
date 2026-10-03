# JUNG Media -> Gleemour Public Assets

## Estado

Gleemour queda preparado para consumir providers externos de activos públicos mediante el contrato `public-assets.v1`.

JUNG Media implementará el provider concreto cuando corresponda.

## Punto de integración

Contrato:

`src/application/publicAssets/PublicAssetContract.ts`

Composition root:

`src/app/publicAssets/GleemourPublicAssets.ts`

Bootstrap:

`src/app/publicAssets/configurePublicAssets.ts`

## Provider requerido

JUNG Media debe implementar una instancia compatible con:

PublicAssetProvider

La implementación concreta se registrará mediante:

configurePublicAssets([
  jungMediaPublicAssetProvider
]);

## Precedencia

La resolución queda definida así:

1. Providers externos, en orden de registro.
2. LocalPublicAssetProvider.
3. null.

El resolver mantiene comportamiento fail-soft.

## Gleemour no conoce infraestructura Media

La aplicación no debe conocer ni implementar:

- transporte interno
- endpoints propios de Media
- autenticación Media
- storageKey
- filesystem
- buckets
- R2
- Cloudflare
- incoming-public
- library-public

JUNG Media traduce su modelo interno hacia `PublicAssetProvider`.

## Roles de brand

- logo-primary
- logo-light
- logo-dark
- symbol
- favicon
- app-icon

## Roles social

- og-default
- og-category
- og-campaign
- og-product

Preset social:

- id: social-og-v1
- width: 1200
- height: 630
- mimeType: image/jpeg

## Consumidores Gleemour

Home:
og-default

Catalog:
og-default

Category:
og-category

Campaign:
og-campaign

Product:
og-product

## Fallback producto

1. og-product
2. imagen HTTPS pública del producto
3. og-default
4. logo canónico local

## Regla de integración

La conexión futura de JUNG Media no debe requerir modificaciones en Home, Catalog, Category, Product ni SEO.

Un cambio incompatible con `public-assets.v1` debe introducir una versión contractual nueva.
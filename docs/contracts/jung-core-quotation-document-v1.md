# JUNG CORE Quotation Document Contract v1

Este contrato conecta Gleemour Admin con JUNG CORE Commercial Publishing sin
acoplar la aplicación a almacenamiento, renderizadores ni proveedores físicos.

## Entrada

`QuotationPdfOutputRequest` se transforma en `QuotationDocumentRequest` y se
entrega exclusivamente mediante `QuotationDocumentPort.publish()`.

El request transportable usa el esquema `jung-core.quotation-document.v1` e
incluye:

- `requestId` idempotente por cotización y versión del snapshot.
- `appId`, `documentKind`, `locale`, `currency` y `requestedAt`.
- Snapshot completo de cliente, condiciones, líneas, precios y totales.

La fuente de verdad ejecutable está en
`src/application/admin/QuotationPublishing.ts`.

## Salida

JUNG CORE debe responder uno de estos estados:

- `ready`: publicación y PDF disponibles mediante referencias públicas.
- `pending`: publicación aceptada pero todavía en proceso.
- `unavailable`: integración o proveedor temporalmente no disponible.
- `failed`: fallo tipificado con indicador `retryable`.

Una salida `ready` contiene `publicationId`, `publicUrl`, `publishedAt` y un
`PublicAssetReference` PDF con `assetId`, `url`, MIME y versión.

## Transporte

Gleemour usa `VITE_JUNG_CORE_COMMERCIAL_PUBLISHING_URL` como endpoint lógico.
El adaptador envía JSON por HTTP, pero el contrato no conoce Cloudflare,
Hostinger, buckets, rutas internas, SDKs ni el renderer utilizado por CORE.

Si el endpoint no existe, Gleemour responde `JUNG_CORE_NOT_CONFIGURED`; nunca
fabrica un PDF local ni presenta una publicación ficticia.

## Invariantes

1. El snapshot enviado no cambia cuando el borrador local se modifica.
2. Editar la cotización invalida cualquier salida anterior en la interfaz.
3. WhatsApp funciona sin PDF y adjunta `publicUrl` únicamente cuando CORE
   devuelve una publicación `ready` válida.
4. Las respuestas incompatibles se cierran como `JUNG_CORE_INVALID_RESPONSE`.

# Gleemour Admin — M9A Commercial Output Contract

Estado: preparado, sin integración real con JUNG CORE.

## Arquitectura encontrada

`QuotationSnapshot` ya contiene todos los datos necesarios para una salida de
cotización. `CatalogVersionSnapshot` conserva identidad, fuente, orden e IDs,
pero necesita un snapshot mínimo de productos para ser renderizable sin volver
a consultar Sheets. El PDF vigente se solicita mediante
`QuotationDocumentPort`; no existen todavía exportadores CSV, print o image.

## Límite consolidado

El flujo neutral queda definido así:

`Admin → CommercialComposition → CommercialOutputRequest → CommercialOutputEngine → CommercialOutputResult`

- `CommercialComposition` describe qué se quiere mostrar.
- `format` y `options` describen la salida solicitada sin contaminar el contenido.
- `CommercialOutputEngine` es el puerto; no conoce React ni Google Sheets.
- `CommercialOutputResult` normaliza estados y referencia un artefacto.
- JUNG CORE será un adaptador futuro del puerto, no el propietario del dominio.

## Composiciones Gleemour

- Catálogo: versión de catálogo más snapshots mínimos de producto, en el orden
  resuelto. Las imágenes del producto son assets de entrada.
- Cotización: `QuotationSnapshot`, con cliente, condiciones, líneas y totales.
- Una salida `image` es un artefacto generado y no se confunde con la imagen de
  producto incluida en la composición.

## Compatibilidad

M9A no elimina ni reescribe `QuotationDocumentPort`,
`publishQuotationPdf` ni `JungCoreQuotationDocumentPort`. El flujo PDF actual
permanece operativo mientras el contrato transversal queda disponible para una
migración progresiva. La selección del adaptador vigente se realiza en
`App.tsx`; `QuotationWorkspace` ya no importa ni construye JUNG CORE.

## Siguiente punto de conexión

M9B podrá implementar `JungCoreCommercialOutputEngine` cuando exista un contrato
real aprobado de transporte, autenticación, endpoint y respuesta. Hasta ese
momento no se inventan API, credenciales ni capacidades del proveedor.

## Fuera de alcance

Productos, categorías, precios, stock, Google Sheets, CRUD de CORE,
sincronización bidireccional y construcción de renderers completos.

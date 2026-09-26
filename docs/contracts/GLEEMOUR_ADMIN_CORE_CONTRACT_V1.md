# Gleemour Admin ↔ JUNG CORE Contract v1

Estado: preparado por M8. Este documento define límites; no presupone backend,
autenticación, base de datos ni proveedor de infraestructura. El repositorio
real de JUNG CORE no está accesible/verificable desde el entorno de M8C.

## 0. Estado de implementación

| Elemento | Estado | Evidencia |
|---|---|---|
| Product normalizado desde Sheets | IMPLEMENTED | `normalizeProduct` y `loadAllProductsForAdmin` |
| ProductSelection por IDs | IMPLEMENTED | `AdminCoreContracts.ts` |
| Repositorio de lectura Sheets | IMPLEMENTED | `SheetsAdminDataRepository.ts` |
| Repositorio local de cotizaciones | IMPLEMENTED | `QuotationDraftStore.ts` |
| Snapshot de catálogo | PREPARED | contrato y helper sin persistencia remota |
| Puerto de documento de cotización | IMPLEMENTED | contrato consumidor y adaptador configurable |
| ProductRepository servido por CORE | PLANNED / BLOCKED | requiere repetir M9A con CORE verificable |
| DTO, endpoint y persistencia Product de CORE | UNKNOWN | no existe evidencia accesible en M8C |

## 1. Propiedad de dominios

| Entidad | Owner actual | Owner futuro | Mutabilidad | Snapshot | ID primario |
|---|---|---|---|---|---|
| Product | Sheets/Gleemour Catalog | Sheets/Gleemour Catalog en esta fase | live, solo lectura en Admin | No | `Product.id` |
| ProductSelection | Gleemour Admin | Gleemour Admin | transitoria | No | lista de `productId` |
| Catalog draft | Gleemour Admin | Por definir tras M9A | editable | No | `catalogId` opcional |
| Catalog version | No persistida | Gleemour Admin; persistencia por definir | inmutable al quedar ready | Sí | `catalogVersionId` |
| Quotation draft | Gleemour Admin | Gleemour Admin | editable | No | `quotationId` |
| Quotation snapshot | Gleemour Admin | Gleemour Admin | histórico | Sí | `quotationVersionId` |
| Salida comercial | Motor detrás de un puerto neutral | JUNG CORE — renderer futuro | salida | Sí | `publicationId` externo |

## 2. Identidades

| Entidad | Identidad | Campo humano/versionado | Regla |
|---|---|---|---|
| Product | `productId` | `productCode` | En v1 ambos derivan de `Product.id`; consumidores deben tratarlos como conceptos distintos. |
| Catalog | `catalogId` | `catalogVersionId`, `versionNumber` | Una versión pertenece a un catálogo y es inmutable al quedar `ready`. |
| Quotation | `quotationId` | `quotationNumber`, `quotationVersionId`, `revision` | El número es comercial y opcional; nunca reemplaza la identidad técnica. |

La equivalencia temporal `productId === productCode` es una deuda de migración,
no una garantía del contrato. Si el contrato real de CORE distingue ambos, un
adaptador futuro deberá mapearlos sin cambiar los consumidores. M8C no conoce
ni afirma cuál será el identificador real de CORE.

El modelo `Product` actual usa `id`, `title`, `price`, `offer_price`, `stock`,
`status`, categorías, subcategorías, campañas, prioridad y `updated_at`. Todavía
no posee campos separados para `code`, `name`, `publicationStatus`, `createdAt`
ni metadata de provider; corresponden a deuda/mapeo futuro, no a datos inventados.

## 3. Ciclo de vida y mutabilidad

| Objeto | Estado de datos | Mutable | Persistencia actual |
|---|---|---:|---|
| Product | live/read model | No desde Admin | proveedor detrás de repositorio |
| ProductSelection | handoff transitorio | Sí | ninguna |
| CatalogCompositionDraft | borrador editable | Sí | ninguna |
| CatalogVersionSnapshot | snapshot resuelto | No | contrato preparado, sin repositorio |
| QuotationDraft | borrador editable | Sí | localStorage encapsulado |
| QuotationSnapshot | snapshot de entrega | No | entregable mediante puerto configurable |

Los snapshots copian arrays, configuración, cliente, condiciones y líneas. Un
cambio posterior del producto o borrador no puede alterar una versión lista.

## 4. Repositorios y puertos

`ProductRepository` expone `listProducts()` y `getProduct(productId)`. El
adaptador vigente es Sheets, pero los componentes UI no importan Sheets.
`CatalogReferenceRepository` añade subcategorías y campañas.

`QuotationDraftRepository` expone `listDrafts`, `getDraft`, `saveDraft` y
`deleteDraft`. Su adaptador local conserva la clave y el esquema v1 existentes;
normaliza registros antiguos al leerlos. Cambiar a CORE no requiere modificar
la composición de cotizaciones.

No se implementa un `CatalogRepository` ficticio: hoy no existe persistencia de
catálogos. El límite persistible es `CatalogDraftContract`; el repositorio se
añadirá cuando exista un consumidor real de CORE.

La publicación PDF vigente usa `QuotationDocumentPort`. M9A añade el límite
transversal `CommercialOutputEngine` para PDF, CSV, print e image sin retirar
el flujo actual. URLs, almacenamiento, renderer y transporte pertenecen al
adaptador/proveedor de salida, no al dominio Admin. La implementación real de
JUNG CORE continúa pendiente de un contrato técnico aprobado.

## 5. Handoffs

Product Explorer entrega únicamente `ProductSelection`. Catalog Workspace usa
los IDs para construir una fuente manual. Quotation Workspace resuelve esos IDs
contra productos live una sola vez y genera líneas snapshot con nombre, código,
imagen, stock y precios.

No se transfieren objetos React, estado visual ni estructuras del proveedor.

## 6. Capacidades

| Área | Disponible hoy | No disponible todavía |
|---|---|---|
| Products | leer, seleccionar | editar, precio, stock, publicar, archivar |
| Catalogs | componer, previsualizar | guardar, publicar, archivar |
| Quotations | componer, guardar borrador, PDF por CORE, WhatsApp | persistencia remota |

`ADMIN_CAPABILITIES` es la fuente tipada. La UI no debe mostrar acciones como
operativas si su capacidad es falsa.

## 7. Compatibilidad y migración a CORE

1. Mantener estables los IDs locales hasta auditar los IDs reales de CORE.
2. Mantener JUNG CORE limitado al motor de salidas comerciales.
3. Migrar borradores locales preservando `version: 1`, IDs, timestamps y líneas.
4. Resolver la separación `productId/productCode` según evidencia de M9A, no en UI.
5. Añadir persistencia de catálogo solo junto con su caso real de guardado.
6. Implementar `JungCoreCommercialOutputEngine` únicamente al aprobar el
   contrato técnico real de JUNG CORE.
7. Cambiar factories en la raíz de composición; no cambiar workspaces.

## 8. Invariantes verificables

- Los handoffs eliminan IDs duplicados y no comparten el array de origen.
- La UI administrativa no importa `integrations/sheets` directamente.
- Una cotización conserva sus datos aunque cambie el producto live.
- Una versión de catálogo conserva su composición después de crearse.
- El repositorio local lee borradores v1 y falla cerrado ante datos inválidos.
- El request PDF contiene una `quotationVersionId` separada de número e ID.

## 9. Fuera de alcance

Backend, API general, autenticación, roles, pedidos, facturación, inventario,
CRM, editor completo de productos y publicación real de catálogos.

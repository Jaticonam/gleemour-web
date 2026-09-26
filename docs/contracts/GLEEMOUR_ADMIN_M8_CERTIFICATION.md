# Gleemour Admin — Certificación M8C

Fecha: 2026-09-26
Base HEAD: `d5dfcd36c28475c2308c5c1da0a5e8d867842e05`
Rama: `main`
Veredicto: **CERTIFIABLE WITH NON-BLOCKING DEBT**.

## A. Evidencia inicial

- Ruta auditada: `/workspace/scratch/4c19c599e8f3/gleemour-v13-zoi3zc`
- Branch: `main`.
- HEAD: `d5dfcd36c28475c2308c5c1da0a5e8d867842e05`.
- Staging vacío.
- Working tree M8: 11 archivos modificados y 4 archivos nuevos.
- Desbloqueo M8C: 3 correcciones mecánicas en archivos históricos y este reporte.
- No hubo commit, push, merge ni deploy.

## B. Inventario de cambios M8

| Archivo | Cambio | Dominio | Riesgo | Clasificación |
|---|---|---|---|---|
| `src/application/admin/AdminCoreContracts.ts` | Nuevo | contratos/capabilities | Bajo | EXPECTED |
| `src/application/admin/AdminCoreContracts.test.ts` | Nuevo | tests | Bajo | EXPECTED |
| `src/infrastructure/admin/SheetsAdminDataRepository.ts` | Nuevo | provider/repository | Medio | EXPECTED |
| `docs/contracts/GLEEMOUR_ADMIN_CORE_CONTRACT_V1.md` | Nuevo | documentación | Bajo | EXPECTED |
| `CatalogComposition.ts` | Snapshot e IDs de versión | Catalogs | Medio | EXPECTED |
| `CatalogComposition.test.ts` | Inmutabilidad e identidad | tests | Bajo | EXPECTED |
| `QuotationComposition.ts` | `quotationVersionId` | Quotations | Bajo | EXPECTED |
| `QuotationComposition.test.ts` | Snapshot frente a Product mutable | tests | Bajo | EXPECTED |
| `QuotationDraftStore.ts` | Repository CRUD compatible | repositories | Medio | EXPECTED |
| `QuotationDraftStore.test.ts` | CRUD/compatibilidad | tests | Bajo | EXPECTED |
| `CatalogWorkspace.tsx` | Consume repositorio adaptador | Catalogs | Bajo | EXPECTED |
| `ProductExplorer.capabilities.ts` | Capabilities centralizadas | Products | Bajo | EXPECTED |
| `ProductExplorer.tsx` | Consume repositorio adaptador | Products | Bajo | EXPECTED |
| `QuotationWorkspace.tsx` | Repositorio y compatibilidad legacy | Quotations | Medio | EXPECTED |
| `AdminPage.tsx` | ProductSelection explícito | handoffs | Bajo | EXPECTED |

No se encontraron archivos `SUSPICIOUS`, `OUT_OF_SCOPE`, `GENERATED` ni
`UNKNOWN`. Este documento de certificación es un archivo M8C adicional y no
forma parte de los 15 cambios M8 inventariados.

El desbloqueo M8C corrigió exclusivamente los cuatro errores globales:

- `normalizeCampaign.ts`: eliminó dos escapes innecesarios en una expresión regular.
- `command.tsx`: reemplazó una interfaz vacía por un alias de tipo equivalente.
- `textarea.tsx`: reemplazó una interfaz vacía por un alias de tipo equivalente.

Son cambios semánticamente equivalentes, necesarios para cerrar el gate de lint.

## C. Contratos certificados

- Product: modelo live normalizado; `id` sigue funcionando también como código.
- ProductSelection: IDs estables, deduplicados y sin depender de nombre/índice.
- Catalog: Source, Composition, Settings, Draft y VersionSnapshot separados.
- Quotation: Draft editable; líneas y Snapshot congelan datos comerciales.
- Repositories: lectura Product/maestros y CRUD local de borradores definidos.
- Capabilities: describen disponibilidad funcional; no son permisos/auth.
- No existe `CatalogRepository` vacío: se difiere hasta un caso de persistencia real.

## D. Live vs snapshot

| Entidad | Estado certificado |
|---|---|
| Product | LIVE |
| ProductSelection | TRANSIENT |
| CatalogDraft | EDITABLE |
| CatalogVersion | SNAPSHOT PREPARED |
| QuotationDraft | EDITABLE |
| QuotationSnapshot | SNAPSHOT |

## E. Ownership

Sheets/Gleemour Catalog es la fuente actual de Product. Gleemour Admin gobierna
selecciones y borradores locales. JUNG CORE solo se consigna como objetivo
arquitectónico futuro; DTO, endpoint, IDs, precio, stock y estados CORE están
`UNKNOWN / PENDING M9A`.

## F. Regresión Productos

**PASS automatizado.** Carga inyectable, KPIs, búsqueda, filtros, selección,
vistas, columnas, sorting, density, drawer y handoffs están cubiertos por las
pruebas ProductExplorer/AdminPage. No cambió CSS ni comportamiento visual.

## G. Regresión Catálogos

**PASS automatizado.** Fuentes all/category/subcategory/campaign/manual,
orden, exclusión reversible, título, preview y handoff continúan cubiertos.
Excluir un producto no modifica Product.

## H. Regresión Cotizaciones

**PASS automatizado.** Handoff, líneas, cantidad, precios, subtotal, total,
cliente ad hoc, validez, borradores, dirty state, PDF y WhatsApp están cubiertos.
Los borradores v1 conservan compatibilidad de lectura.

## I. CSS / responsive

No corresponde a M8: ninguno de los 15 archivos altera CSS/layout. La regresión
de componentes pasa; no se repitió una certificación visual de breakpoints.

## J. Tests

- Comando: `npm test`.
- Resultado: **PASS**.
- 28 archivos; 135 tests PASS; 0 FAIL; 0 SKIP.

## K. Lint

- Parche M8: **PASS**.
- Global `npm run lint`: **PASS**, exit code 0.
- Resultado: 0 errores y 26 warnings históricos de Fast Refresh/hooks.
- Los cuatro errores históricos fueron resueltos mediante el lote mínimo M8C,
  sin refactorización masiva ni cambios funcionales.

## L. Build y typecheck

- `npx tsc --noEmit`: **PASS**.
- `npm run build`: **PASS**; 1,981 módulos transformados.
- `git diff --check`: **PASS**.

## M. Documentación

- Actualizado `GLEEMOUR_ADMIN_CORE_CONTRACT_V1.md` para diferenciar
  IMPLEMENTED, PREPARED, PLANNED y UNKNOWN.
- Generado este `GLEEMOUR_ADMIN_M8_CERTIFICATION.md`.

## N. M9 status

**BLOCKED BY ENVIRONMENT: JUNG CORE repository unavailable.**

Esto significa que el repositorio no está accesible/verificable desde este
entorno; no significa que JUNG CORE no exista globalmente. M9 debe reanudarse
desde M9A, nunca desde M9B, después de cerrar M8 y disponer de CORE real.

## O. Riesgos y deuda

- `Product.id` y código comercial aún son el mismo valor en v1.
- Product no tiene todavía `code`, `name`, `publicationStatus`, `createdAt` ni
  provider metadata separados.
- Catálogos no tienen repositorio/persistencia; es una decisión deliberada.
- Persisten 26 warnings históricos no bloqueantes de lint global.
- La selección vive en memoria y no sobrevive una recarga completa.

## P. Diff stat

El diff rastreado debe informarse junto con los archivos nuevos no rastreados,
porque `git diff --stat` todavía no incluye estos últimos. El resumen final se
recalcula antes de cualquier commit.

## Q. Estado Git final esperado

`main`, base HEAD sin mover, staging vacío y working tree deliberadamente
modificado. Ningún archivo fue preparado durante M8C.

## R. Veredicto

**CERTIFIABLE WITH NON-BLOCKING DEBT.** La implementación M8 es funcional,
coherente y pasa tests, lint global, typecheck, build y whitespace. Los 26
warnings preexistentes no provocan exit code fallido ni afectan el scope M8.

## S. Commit propuesto

Mensaje propuesto, sin ejecutarlo:

`feat(admin): consolida contratos M8 para integración con JUNG CORE`

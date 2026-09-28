# M9B.2 — Commercial image publishing adapter

## Runtime and security

Gleemour is deployed as a static Vite SPA. It has no authenticated server API.
`server/JungCoreCommercialImagePublisher.ts` is therefore a **server-only**
library; neither React nor the production bundle imports it. The adapter reads
`JUNG_CORE_WRITE_KEY` from the server process, calls CORE's
`POST /commercial/artifacts` and maps its response to the existing
`CommercialOutputResult`. It does not talk to R2 or PostgreSQL.

M9B.2 does not enable publishing in Catalog Workspace. A production UI action
requires an authenticated server route/BFF with an admin session; do not expose
the CORE write key via `VITE_*`, CORS, a browser call, localStorage, or a public
proxy. That route and its deployment are outside M9B.2.

## Contract

- The caller supplies an existing `CommercialOutputRequest` and the rendered
  `CatalogImageArtifact` from M9B.1. It does not recalculate the composition.
- CORE fields: `appId=gleemour`, `brand=gleemour`,
  `compositionType=catalog`, deterministic slug IDs for the request and
  composition, the numeric catalog version, JPEG bytes as base64, and
  `mimeType=image/jpeg`. CORE owns the content fingerprint and idempotency.
- The adapter checks CORE's returned SHA-256 against the renderer checksum and
  maps `jobId`, `artifactId`, `publicUrl`, filename, and MIME to
  `CommercialOutputResult`. A ready job is never reported if the checksums
  disagree.
- The endpoint must be HTTPS, except localhost for local development. The
  request times out after 30 seconds. HTTP 401, 409, 4xx, and 5xx have
  distinct controlled results; transport exceptions reveal no credentials.

## Local certification

The guarded integration test uses Chrome to run the **real M9B.1 canvas
renderer** on a synthetic one-product composition. It passes its actual JPEG
bytes from the browser to the server-only adapter in the test process; the
browser and Vite subprocess receive no CORE secrets. CORE, PostgreSQL and R2
run only against the development environment. The test validates public
readback SHA-256, idempotency, conflict response and persisted Prisma row.

Requirements: Node 24, Chrome installed, CORE at commit `266bc27` with
dependencies, generated Prisma Client and build, its development migration
deployed, and CORE's ignored `.env` configured for `jung_core_dev` and
`jung-commercial-dev`. From Gleemour's PowerShell directory:

```powershell
$env:GLEEMOUR_CORE_E2E = "1"
$env:JUNG_CORE_LOCAL_DIR = "D:\JUNG\core\jung-core"
try {
    node --env-file="D:\JUNG\core\jung-core\.env" .\node_modules\vitest\vitest.mjs run server/CommercialImage.e2e.test.ts
    if ($LASTEXITCODE -ne 0) { throw "M9B.2 E2E: FAIL" }
    Write-Host "M9B.2 E2E: PASS"
} finally {
    Remove-Item Env:GLEEMOUR_CORE_E2E, Env:JUNG_CORE_LOCAL_DIR -ErrorAction SilentlyContinue
}
```

The test starts and stops local CORE and Vite subprocesses. It leaves a
synthetic JPEG and a job in the development bucket/database as evidence. It
prints neither secret values nor the public URL. Without the opt-in variable,
the E2E test is skipped during normal `npm test`.

## Gates

`npm test`, `npm run lint`, `npm run typecheck:m9b2`, `npm run build` and
`git diff --check`. The global Gleemour TypeScript app check has 42 existing
errors at `6454f1d` and must be reported separately; M9B.2 adds zero.

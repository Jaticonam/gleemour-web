# M9B.3 — Catalog image output control

Catalog Workspace now renders the existing M9B.1 JPEG (1080 × 1440) for one to six selected products, displays a local preview and offers a download. It uses the current draft order and prices. It invalidates the generated file when the draft or selected product data changes, and warns if a product image needs a fallback. The preview identity is explicitly local and is never submitted to CORE.

## Production boundary

The Hostinger workflow publishes only Vite's static `dist/` to `hostinger-production`. `/admin` has no authenticated server session. This lot does not place `JUNG_CORE_WRITE_KEY` or R2 credentials in the frontend and does not add a browser call to CORE. The M9B.2 publisher remains a server-only library.

To enable the **Publish** action, provision a server runtime reachable from Gleemour and an authenticated admin endpoint. It must validate the admin session and request origin, accept the rendered JPEG, enforce size/MIME and checksum, assign or retrieve a persistent catalog/version identity, call the M9B.2 publisher using server environment secrets, and return its controlled `CommercialOutputResult`. Configure a production CORE endpoint and storage separately from the development credentials. Only after that route has been tested with unauthorized and authorized requests should the browser offer publication. A public proxy or a `VITE_*` write key is prohibited.

The local JPEG download can ship with the static site independently of the server-side publication flow. Merge to `main` triggers the Hostinger production build; keep release review separate from the development certification.

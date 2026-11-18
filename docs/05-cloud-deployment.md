# 05 - The front inside a cloud platform

The front and back of the web app are expected to run on **Outscale** (3DS Outscale, French
sovereign IaaS, SecNumCloud-oriented). The points below stay valid on any similar platform.
Outscale specifics to verify with the platform team: Kubernetes service (OKS) or plain VMs for
the nginx container, S3-compatible object storage (OOS) as an option to host the static bundle
and tiles, load balancer / TLS termination, and the outbound-internet policy (section 3b).
The map migration changes what the front calls at runtime, so it must be designed for that.

## 1. Build once, configure at runtime

`public/config.json` is fetched before bootstrap (`provideAppInitializer`). The platform mounts
or templates one small file per environment: tile URL, geocoder URL, default view. No rebuild,
same image in dev / staging / prod. Serve it with `Cache-Control: no-store`.

## 2. Static bundle, container-ready

`Dockerfile`: multi-stage (Node build -> unprivileged nginx on port 8080, non-root, read-only
friendly). `deploy/nginx.conf` does the SPA fallback, immutable caching for hashed assets,
no-store for `config.json` and `index.html`, and the security headers.

## 3. Same-origin for third-party calls

Browser -> third party (tiles, geocoder) means CORS, an extra egress path to open, and IP leaks.
Preferred: the platform's reverse proxy / ingress exposes `/tiles/` and `/geocode/` on the app's
own origin and forwards to the real service (self-hosted, or an allow-listed external one).
Then `config.json` becomes:

```json
{ "tileUrl": "/tiles/{z}/{x}/{y}.png", "geocoder": "ban", "geocoderBaseUrl": "/geocode" }
```

and the CSP only needs `'self'`. Proxy caching of tiles also cuts upstream load. A commented
example is in `deploy/nginx.conf`.

## 3b. If the platform is egress-restricted

Strict platforms often block outbound internet from workloads. Then public OSM tiles and
public geocoders are simply unreachable: self-host both inside the platform (see
[03](03-tiles-and-geocoding.md)). Decide this **before** development: it changes the effort
from "change a URL" to "operate a tile server".

## 4. Content-Security-Policy

With direct third-party calls, `img-src` must allow the tile host and `connect-src` the
geocoder host; remove the Google domains (`maps.googleapis.com`, `maps.gstatic.com`,
`*.googleusercontent.com`) from the policy. Leaflet injects inline styles on the map
container: allow `style-src 'unsafe-inline'` only if you cannot nonce them, and document it.

## 5. Back-end contract (unchanged by the migration)

The front keeps calling the same booking API (`GET /offices`, `GET /offices/{id}/slots`,
`POST /appointments`). One recommended addition: the **back-end should return office
coordinates** (`lat`, `lng`) so the front never geocodes office addresses at runtime; geocode
once, server-side, when an office is created or edited.

## 6. Operations

- Health: `GET /healthz` on nginx for liveness/readiness.
- Observability: log tile/geocoder failures client-side (no personal data) so a provider
  outage is visible; the UI already degrades to the list.
- Degradation: if tiles fail the list and booking still work. Keep it that way.

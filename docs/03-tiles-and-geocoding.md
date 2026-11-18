# 03 - Tiles and geocoding: choosing providers

> Usage policies change. Re-read the linked policy before going to production; the values below
> are the ones to verify, not a legal opinion.

## Tiles

| Source | When | Caveats |
| --- | --- | --- |
| `tile.openstreetmap.org` | Demo, dev, very low traffic | Volunteer-run, **no SLA**, usage policy forbids heavy or commercial-grade load. Attribution required. Do not use for production. |
| Commercial tile host (MapTiler, Stadia, Jawg...) | Fast path to production | Key + quota + contract; check data-hosting region and GDPR terms. |
| IGN Geoplateforme (WMTS, e.g. Plan IGN) | French public-sector context | French, free, no OSM data (IGN data): fine if "OpenStreetMap" is not a hard requirement. Verify layer name and terms. |
| **Self-hosted** (OpenMapTiles / Protomaps PMTiles / `tileserver-gl` behind your reverse proxy) | Production with data-sovereignty or no-third-party-call constraints | You run it: planet extract for France is a few GB, updates on a schedule. Best fit for a closed cloud. |

The tile URL lives in `public/config.json` (`tileUrl`), so changing source is a config change.

## Geocoding

| Source | Fit | Caveats |
| --- | --- | --- |
| **BAN / Géoplateforme geocoder** (default here) | French addresses, free, no key | Verify the current base URL (the service was moving to the Géoplateforme). Configurable via `geocoderBaseUrl`. |
| Nominatim (OSM) | Worldwide, free-form places | Public instance: max ~1 request/s, no autocomplete, identify the app. Self-host for real use. |
| Photon (autocomplete on OSM data) | Typeahead UX | Self-host. |

Rule of thumb: **debounce** user input (300 ms) and require 3+ characters, whatever the provider.

## Routing (if directions are needed)

OSRM, Valhalla or OpenRouteService, **self-hosted**; the public demo servers are not for
production. Cheapest option for a first release: a "get directions" link to an external
router, no embedded routing.

## Decision

- Dev / demo: public OSM tiles + BAN.
- Production: self-hosted or contracted tiles, BAN (or its successor) via the platform's
  reverse proxy, so the browser only talks to the app's own origin (see
  [05](05-cloud-deployment.md)).

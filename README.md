# 32 - Migration Google Maps to OpenStreetMap

How to move an Angular web app from **Google Maps** to **OpenStreetMap**, shown on a small
working demo: a citizen-facing **appointment booking** app (find the nearest office on a map,
pick a slot, confirm).

Angular 22, standalone components, signals, Leaflet. No backend: data is in memory.

## What the demo covers

| Feature | Google Maps version | This project |
| --- | --- | --- |
| Map + office markers | `@angular/google-maps` | Leaflet behind a `MapAdapter` interface |
| Address search | Geocoder / Places Autocomplete | French national address API (BAN), Nominatim as an alternative |
| "Near me" | Geolocation + Distance Matrix | Browser geolocation + haversine |
| Office list sorted by distance | `geometry.spherical` | `distanceKm()` |
| Slot choice and confirmation | unchanged | unchanged (map is only the *locator*) |

## Run it

```powershell
npm install
npm start        # http://localhost:4200
npm test
npm run build
```

`.npmrc` sets `legacy-peer-deps=true`, as in the sibling Angular projects.

## Reading order

1. [docs/01-scope.md](docs/01-scope.md): what the app does and where the map sits in it
2. [docs/02-api-mapping.md](docs/02-api-mapping.md): Google Maps API -> OSM equivalent, one by one
3. [docs/03-tiles-and-geocoding.md](docs/03-tiles-and-geocoding.md): choosing tile and geocoding providers (usage policies)
4. [docs/04-accessibility-and-privacy.md](docs/04-accessibility-and-privacy.md): RGAA/WCAG for maps, GDPR benefits
5. [docs/05-cloud-deployment.md](docs/05-cloud-deployment.md): the front inside a cloud platform (runtime config, CSP, proxy, container)
6. [docs/06-migration-plan.md](docs/06-migration-plan.md): step-by-step plan, checklist, rollback

## Layout

```
src/app/core/map/        MapAdapter (interface) + LeafletMapAdapter (only file importing leaflet)
src/app/core/geocoding/  Geocoder (BAN | Nominatim, chosen in config.json)
src/app/core/config.ts   runtime config loaded from /config.json before bootstrap
src/app/features/        find-office (list + map), booking (slots + form)
deploy/                  nginx.conf (CSP, SPA fallback, cache rules), used by the Dockerfile
public/config.json       tile URL, geocoder, default view: change without rebuilding
```

## Key decisions

- **One seam for the map** (`MapAdapter`): swapping Leaflet for MapLibre, or one tile provider
  for another, never touches components.
- **Runtime config, not `environment.ts`**: the same bundle/image is promoted dev -> prod.
- **Map is never the only source of information**: every office is also in an accessible list.
- **Public OSM tile server is for the demo only**: see [docs/03](docs/03-tiles-and-geocoding.md).

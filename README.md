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

## Google vs OpenStreetMap in the same app

- `mapProvider` in `public/config.json` (`"osm"` or `"google"`) selects the map for the whole app.
  Flipping it back is the rollback path.
- `/` is the citizen page, in French: address, postcode or city search, "locate me", click on the
  map, filters by country/region/city, the nearest agency with photo, a light SVG plan (compass,
  streets, post office, bakery, town hall, transport) and a "my navigation app" hand-off. The map
  is optional and only started on request; everything is also in the table.
- `/compare` shows both maps side by side on the same data and selection.
- `/analysis` presents the stakeholders and their needs, which option covers which need
  (walk, bike, transit, car included) and what comparable organisations use. Source data in
  `src/app/features/analysis/analysis-data.ts`, written up in `docs/07`.
- Google needs an API key. Copy `public/config.local.example.json` to
  `public/config.local.json` (gitignored, never commit it: this repo is public) and set
  `googleApiKey`. Without a key Google shows its "development purposes only" error.
- Restrict the key to `http://localhost:4200/*` and the Maps JavaScript API, and cap the quota
  and set a budget alert in Google Cloud so a test can never be billed.
- With `mapProvider: "osm"` the Google SDK is never requested.

## Reading order

1. [docs/01-scope.md](docs/01-scope.md): what the app does and where the map sits in it
2. [docs/02-api-mapping.md](docs/02-api-mapping.md): Google Maps API -> OSM equivalent, one by one
3. [docs/03-tiles-and-geocoding.md](docs/03-tiles-and-geocoding.md): choosing tile and geocoding providers (usage policies)
4. [docs/04-accessibility-and-privacy.md](docs/04-accessibility-and-privacy.md): RGAA/WCAG for maps, GDPR benefits
5. [docs/05-cloud-deployment.md](docs/05-cloud-deployment.md): the front inside a cloud platform (runtime config, CSP, proxy, container)
6. [docs/06-migration-plan.md](docs/06-migration-plan.md): step-by-step plan, checklist, rollback
7. [docs/07-value-analysis.md](docs/07-value-analysis.md): value analysis of the map function (needs, options, data, mobile)

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

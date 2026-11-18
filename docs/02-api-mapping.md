# 02 - Google Maps -> OpenStreetMap API mapping

OpenStreetMap itself is **data**, not a rendering library. A "move to OSM" means choosing three
independent pieces: a **rendering library**, a **tile source**, and a **geocoder** (plus a router
if directions are needed). Google bundles all of them behind one key; here each is replaceable.

## Rendering library

| Option | Tiles | Verdict |
| --- | --- | --- |
| **Leaflet** (this demo) | raster | Small (~40 kB gz), simple API, easiest migration from `google.maps.Map`. Chosen. |
| MapLibre GL JS | vector (WebGL) | Smoother zoom, styling, offline-friendly; heavier, needs vector tiles and a style. Natural next step. |
| OpenLayers | raster + vector | Most complete (projections, WMTS); steeper API. |

## Concept by concept

| Google Maps | OSM equivalent | Notes |
| --- | --- | --- |
| `@angular/google-maps` `<google-map>` | own `<app-osm-map>` wrapping Leaflet (here) or `@bluehalo/ngx-leaflet` | No official Angular wrapper: write a thin component, keep the lib behind an interface. |
| `new google.maps.Map(el, {center, zoom})` | `L.map(el, {center, zoom})` | Leaflet order is `[lat, lng]`; GeoJSON/MapLibre is `[lng, lat]`. Classic bug source. |
| Map tiles (implicit) | `L.tileLayer(url, {attribution})` | You choose and pay/host. Attribution is mandatory. |
| `google.maps.Marker` / `AdvancedMarkerElement` | `L.marker` (+ `L.divIcon`) | Use `divIcon` to avoid the broken default-icon path with bundlers. |
| Marker clustering (`MarkerClusterer`) | `leaflet.markercluster` | Only needed with hundreds of markers. |
| `InfoWindow` | `L.popup` / `marker.bindPopup` | In this demo selection drives a list instead, which is more accessible. |
| `LatLngBounds`, `map.fitBounds` | `L.latLngBounds`, `map.fitBounds` | Same idea; add `padding`. |
| `map.panTo` / `setZoom` | `map.flyTo` / `setView` | |
| `google.maps.Geocoder` | BAN API (France) or Nominatim | See [03](03-tiles-and-geocoding.md). |
| Places Autocomplete | BAN `/search` (fast, address-oriented) | Nominatim forbids autocomplete on the public instance. |
| `geometry.spherical.computeDistanceBetween` | haversine (`distanceKm`) or Turf.js | Straight-line distance, not road distance. |
| Distance Matrix | OSRM `table`, Valhalla, OpenRouteService | Self-host for production. |
| Directions service | OSRM / Valhalla / OpenRouteService, or a deep link to an external router | Often replaced by a "get directions" link to keep scope small. |
| Street View | none (Mapillary is the nearest open equivalent) | Drop the feature or accept a different provider. |
| Static Maps API | none built in | Pre-render, or use a static-map service you host. |
| API key + billing + referrer restriction | none for OSM itself | Providers of tiles/routing may still ask for a key. |

## Pitfalls hit while doing it

- Marker icons break under the Angular bundler (default PNG URLs). Fix: `L.divIcon` + CSS.
- `[lat, lng]` vs `[lng, lat]` between Leaflet, BAN (GeoJSON) and MapLibre.
- Leaflet is CommonJS: add `allowedCommonJsDependencies` or switch to an ESM-friendly build.
- Map container needs an explicit height or it renders at 0 px.
- Destroy the map in `ngOnDestroy` or route changes leak listeners.

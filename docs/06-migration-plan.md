# 06 - Migration plan

## Steps

1. **Inventory** every `google.maps.*` usage, every key, every CSP / cookie-banner mention
   (`grep -r "google.maps\|maps.googleapis\|@angular/google-maps"`). Fill the table in
   [01](01-scope.md).
2. **Decide the three providers** (library, tiles, geocoder) and whether they are self-hosted:
   [03](03-tiles-and-geocoding.md), [05](05-cloud-deployment.md) section 3b.
3. **Introduce the seam first, still on Google**: define `MapAdapter`, write a
   `GoogleMapAdapter` that wraps today's behaviour, switch components to the interface.
   No visible change; this is the safe commit.
4. **Add `LeafletMapAdapter`** behind a config flag (`config.json`), compare both side by side.
5. **Replace geocoding** (`Geocoder` service) and the distance computation.
6. **Move runtime config** to `config.json` if it is still in `environment.ts`.
7. **Accessibility pass** ([04](04-accessibility-and-privacy.md)) and update the accessibility
   statement and privacy notice.
8. **Rollout**: enable OSM for a percentage of traffic or one environment; watch tile and
   geocoder errors.
9. **Cleanup**: remove `GoogleMapAdapter`, the Google script, the API key, the billing account,
   the Google entries in CSP and in the cookie banner.

## Checklist

- [ ] No remaining `google.maps` reference or `maps.googleapis.com` request in the network tab
- [ ] OSM attribution visible on every map
- [ ] Tile provider allowed for production use (not the public OSM server)
- [ ] Geocoder rate limits respected (debounce, min 3 chars)
- [ ] `[lat, lng]` order verified end to end
- [ ] List and booking still work with tiles blocked
- [ ] Keyboard + screen reader pass done
- [ ] CSP updated, Google domains removed
- [ ] Privacy notice and processing register updated
- [ ] Google API key revoked

## Rollback

Because of step 3, rollback is a config flag flip (`mapProvider: "google"`) until step 9.
Do step 9 only after a full release cycle without incident.

## Effort drivers (what makes it small or large)

| Small | Large |
| --- | --- |
| Few markers, no directions, French addresses only | Directions, distance matrix, Street View, static maps |
| External tiles/geocoder reachable from the platform | Egress-restricted platform: self-host tiles + geocoder |
| Office coordinates stored in the back-end | Coordinates computed from addresses at runtime |

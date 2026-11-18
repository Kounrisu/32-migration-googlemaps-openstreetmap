# 04 - Accessibility and privacy

## Accessibility (RGAA 4.1 / WCAG 2.1)

A map is a visual widget; it must never be the only way to get the information or to act.

What the demo does:

- **Same data, two views**: every office on the map is in a list with name, address, distance
  and a "Choose a slot" link. The list is the primary, fully accessible path.
- **Keyboard**: Leaflet keyboard handling stays enabled (arrows pan, +/- zoom); markers are
  focusable and carry `title`/`alt` with the office name.
- **Selection state** is conveyed by `aria-pressed` and a border, not by colour only.
- **Status messages** (results count, geolocation errors) use `role="status"` / `aria-live`.
- **Form labels**, `autocomplete` tokens (`name`, `email`, `street-address`) and visible focus.
- **Geolocation only on explicit click**, with a text fallback (type an address).
- **Skip link** to `#main`.

To audit before release: keyboard-only pass, screen reader pass (NVDA + Firefox), 200% zoom,
contrast of marker and popup colours, and an automated scan (axe, or the sibling
`26-rgaa-assistant` project).

Known limits of Leaflet to document in the accessibility statement: the map canvas itself is
not screen-reader friendly, which is acceptable only because the list is equivalent.

## Privacy / GDPR

- **No Google script, cookie or key**: the usual cookie-consent entry for Google Maps goes
  away, and no personal data (IP, referrer) goes to Google.
- Tile and geocoder requests still reveal the user's IP and the searched address to whoever
  serves them. Mitigations: self-host or proxy through the app's origin, keep the geocoder
  call server-side or same-origin, send the minimum (the query, not the user identity).
- Browser geolocation stays on the device; only the derived coordinates feed the local
  distance sort. Do not log or store them.
- Add the tile/geocoder providers to the privacy notice and the processing register.
- Keep the OSM attribution visible (ODbL requirement).

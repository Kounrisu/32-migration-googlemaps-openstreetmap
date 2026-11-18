# 07 - Value analysis (analyse de la valeur) of the map function

Purpose: decide **what the map must do for the citizen booking an appointment**, then pick the
cheapest solution that does it. This is a first draft built from the stated needs; the weights
and scores are proposals to be validated with the product owner, the DPO and the security
officer. Nothing here is measured yet.

## 1. Need and user

A person must **book an appointment, then actually get to the right place** (often stressed,
possibly on a phone, possibly using assistive technology). The map is not the goal: arriving
on time is.

## 2. Functions

### Principal functions (FP)

| Id | Function | Notes |
| --- | --- | --- |
| FP1 | Find the nearest / most convenient office | address or "near me" |
| FP2 | Book, change or cancel a slot | independent of the map provider |
| FP3 | **Get to the office** (route, public transport, parking, entrance) | the real value of the map |
| FP4 | Recognise the place on arrival (photo of the facade / entrance, floor, door code-free instructions) | see section 5 |

### Constraint functions (FC)

| Id | Constraint | Reference |
| --- | --- | --- |
| FC1 | Accessible to everyone | RGAA 4.1 (WCAG 2.1 AA) |
| FC2 | Secure, hosted and operated under French/EU control | RGS, SecNumCloud-type hosting, ANSSI recommendations, security homologation |
| FC3 | Personal data protected, no unnecessary transfer | RGPD, CNIL rules on location and cookies |
| FC4 | Easy: few steps, readable, works on a weak mobile connection | usability, eco-design (RGESN) |
| FC5 | Works on phone, tablet, desktop; usable with the person's own GPS app | responsive web, deep links |
| FC6 | Low and predictable cost, no pay-per-use surprise | budget |
| FC7 | Replaceable provider (no lock-in) | the `MapAdapter` seam |
| FC8 | Runs inside the target cloud, including without outbound internet | docs/05 |

## 3. Insight that changes the cost: do we need an embedded map at all?

FP3 (getting there) is best served by **the person's own navigation app** (Apple Plans, Google
Maps, Waze, OSM...), which already has live traffic, public transport and voice guidance. So
the app only has to provide **reliable data** (coordinates, address, entrance, access notes,
photo) and **links that open the GPS app**. An embedded map is then useful mainly for FP1
(choosing among offices), and can be simple.

Implemented in the demo: after booking, a "Getting there" block with the address, access notes
and links for Android (`geo:`), Apple Plans, Google Maps, Waze and OpenStreetMap. Links only
send data to the chosen provider **when clicked**, so the page itself makes no third-party call.

## 4. Options compared

Scores 0-3 (3 = best). Proposed weights in brackets. Scores are the author's judgement from
public information and must be challenged.

| Criterion (weight) | A. Google Maps | B. Leaflet + public OSM tiles | C. MapLibre/Leaflet + self-hosted OSM (state-style stack) | D. IGN Géoplateforme tiles | E. No embedded map: list + GPS links |
| --- | --- | --- | --- | --- | --- |
| RGAA (3) | 1 | 2 | 2 | 2 | **3** |
| RGS / security, FR hosting (3) | 0 | 1 | **3** | 2 | **3** |
| RGPD, data stays in the EU (3) | 0 | 1 | **3** | 2 | **3** |
| Ease of use (2) | **3** | 2 | 2 | 2 | 2 |
| Mobile + own GPS app (2) | 3 | 2 | 2 | 2 | **3** |
| Cost, predictable (2) | 1 | 2 (but not allowed in prod) | 2 (hosting + ops) | 2 | **3** |
| Maintenance effort (1) | **3** | 3 | 1 | 2 | **3** |
| No lock-in (1) | 0 | 3 | 3 | 2 | 3 |
| Availability / SLA (2) | **3** | 0 | 2 (you own it) | 1 to verify | 3 |

Reading: **E is the baseline to beat**; C is the best "real map" for a sovereign context; B is
fine only for the PoC; A wins on convenience and loses on RGS/RGPD/cost; D is promising but
its current usage limits were **not verified** (check geoservices.ign.fr "Limite d'usage").

Suggested decision path: ship **E + a light map from C** (FP1 only), keep A behind the config
switch for as long as needed, and drop it once the DPO and security officer confirm.

### 4.1 Observed practice in French public bodies and transport operators

Observed on 2026-11-18 from public pages and press. It shows what others chose; it is not a
recommendation, and an app can differ from its website.

| Organisation | What was observed | Source type |
| --- | --- | --- |
| Caisse de Valmor (national public institution, name changed) | Branch locator page loads **Leaflet** with the **community OSM tile server** (`tile.openstreetmap.org`), attribution "(c) OpenStreetMap contributors" | Page inspected directly |
| RATP (route planner on the website) | **Leaflet** with tiles from the operator's own supplier (onyourmap, RATP Smart Systems), data (c) TomTom. Neither Google nor OSM. | Page inspected directly |
| SNCF Connect (app) | **MapLibre Native** through Flutter for transit maps and journey planning | Community directory (secondary) |
| SNCF Connect & Tech | Launched **Tesmo Maps** (June 2026), built on OpenStreetMap, for operators and local authorities; the customer keeps ownership of its data and can restyle the base map | Trade press, read in full |
| Vélib' | Nothing reliable found | Not established |

What it means for this project:

- None of the sources above relies on Google Maps for what could be observed.
- Leaflet + OSM tiles, which is what the PoC does, matches what at least one public institution
  runs today.
- The community OSM tile server is a demo-grade service with a usage policy that rules out
  heavy production traffic. Production needs a dedicated tile source (IGN Géoplateforme or a
  self-hosted tile server).

### 4.2 Itineraries by mode (walk, bike, public transport, car)

No single public service covers the four modes. Google does, with one key.

| Mode | Public / open option | Verified facts |
| --- | --- | --- |
| Base map, roads and towns | IGN Plan (vector tiles, MapLibre) via cartes.gouv.fr, or the Carte Facile component | Documented on cartes.gouv.fr; styles `standard`, `classique`, `gris`, `accentue` |
| Walk | Géoplateforme route API (`data.geopf.fr/navigation/itineraire`) | Profile `pieton`/pedestrian; IGN BD TOPO data; **5 requests per second per IP** |
| Car | Same API | Shortest or fastest, with exclusions; same rate limit |
| Bike | Not in the IGN API. Self-host **Valhalla** (MIT) or OpenRouteService on OSM data | Engines verified to exist and be open source; hosting effort not measured |
| Public transport | Timetable data from transport.data.gouv.fr (national access point) plus a self-hosted **OpenTripPlanner** or **MOTIS** | Data is open; no fully open-source French transit API was found, Navitia remains an option |
| Any mode, zero cost to us | Deep link to the user's own navigation app (`navigation-links.ts`) | Already implemented |

Risks to size with a load test: the 5 requests per second per IP limit is shared by all
citizens behind one proxy, so a server-side cache and rate limit are needed; the usage terms
of `data.geopf.fr` for a high-traffic public site were **not verified**.

## 5. Data to retrieve and store per office (for GPS, photos, accessibility)

| Data | Why | Notes |
| --- | --- | --- |
| `lat`, `lng` (WGS84) of the **public entrance**, not the building centroid | GPS lands at the door | geocode once, back-end side, verify on the ground |
| Postal address, plus BAN identifier | address search, display | |
| Parking, nearest public transport stop, step-free route | FP3 | free text + structured flags |
| PMR / accessibility information | RGAA/legal duty to inform | |
| Opening hours, closing days | avoid wasted trips | |
| **Photo(s)**: facade, entrance, indoor reception | FP4 | see below |
| Phone / contact | | |

Photos:
- Host them on your own origin (object storage + CDN on the same platform), not a third-party.
- **RGAA**: every informative photo needs a meaningful alternative text (RGAA criterion 1.1),
  decorative ones an empty `alt`. The model has `photo: { src, alt }`.
- **RGPD**: no identifiable people, no number plates, **strip EXIF** (it can contain GPS and device
  data), blur if needed.
- **Eco-design / mobile**: WebP/AVIF, several sizes (`srcset`), lazy loading, fixed dimensions to
  avoid layout shift.
- Keep the list of "who may change photos" in the back office (editorial workflow).

## 6. Phone, tablet and "own portable iOS / Android"

Ordered from cheapest to most costly:

1. **Responsive web app** (what the demo is). No store, one codebase, easiest RGAA/RGS path.
2. **PWA** (installable, offline shell, home-screen icon). Same code. iOS support is more
   limited than Android (notifications, storage), so treat it as an extra, not a base.
3. **Native wrapper (Capacitor)** around the same Angular app, only if a real need appears
   (push reminders, calendar integration, offline booking list). Adds store accounts, review
   cycles, app-level RGAA/RGPD duties and a separate security review.
4. **Fully native apps**: not justified by what is known today.

Whatever the choice: **the GPS hand-off is done with deep links**, so no routing API, no key,
no tracking, and it works on any phone. Provide an `.ics` "add to calendar" file as well.

### 6.1 Users with a weak network and old equipment

A share of the citizens is in a fragile situation: poor mobile coverage, an old phone or an
old computer, little digital habit. This weighs more than any provider choice.

- **Design list first.** Address, phone number, opening times and booking must work without
  the map. The map is an extra loaded on request.
- **Prefer raster tiles (Leaflet) to vector tiles (MapLibre).** Vector maps need WebGL, which
  old devices may lack or run badly. IGN also serves raster WMTS tiles that Leaflet can show.
- **The Angular app itself is a risk.** The build targets ES2022 and recent browsers by
  default, so a very old phone may not start it. Test on real old devices; keep a plain HTML
  fallback (agency list, addresses, phone numbers) and a phone booking route.
- **Budget the page weight** and measure it with a throttled network (3G) and a slowed CPU.
  The production build currently reports about 80 kB transferred for the initial bundle,
  before the map code and tiles; the budget value is to be agreed with the client.
- **No account, short forms, plain language**, large touch targets, and no dependency on a
  third-party script for the essential path.

## 7. Open questions for the stakeholders

1. Who owns the office data (address, entrance coordinates, photos) and who keeps it current?
2. What is the expected number of visits per month, and at the peak? (sizes tile hosting and
   any paid tier)
3. May the browser call a third party at all (DPO/security answer), or must everything stay on
   the platform's own origin?
4. Is the citizen app also meant to be offered as a store app, or is "mobile web" enough?
5. Who validates the accessibility statement and the privacy notice, and when?
6. Which security homologation process applies to this front and to its hosting?

## 8. What the demo does and does not prove

Proves: provider swap behind one interface, deep links for GPS, access notes/photo model,
runtime config. Does not prove: load behaviour, RGAA conformance (no audit yet), security
posture (no scan yet), tile hosting effort, real photos.

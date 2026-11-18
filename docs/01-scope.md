# 01 - Scope of the application being migrated

The app is a public-facing **appointment booking** web app. The migration is only about the
mapping layer; the booking logic must not change.

## Main flows

1. **Find an office**: the user types an address or city, or clicks "Use my position".
2. **See offices on a map and in a list**, nearest first, with the distance.
3. **Choose a slot** at the selected office (days, half-hour slots, unavailable ones disabled).
4. **Confirm**: name + email, then a booking reference.
5. (Back office / not in the demo) manage offices, opening hours, slot capacity.

## Where Google Maps is used today (typical inventory)

| Usage | Where in the flow |
| --- | --- |
| Interactive map with one marker per office | step 2 |
| Info window on marker click (name, address, "book" link) | step 2 |
| Address geocoding / autocomplete | step 1 |
| Browser geolocation + distance to each office | step 1-2 |
| Directions / "how to get there" link | after step 4 |
| API key restricted by HTTP referrer, billing account | all |

Everything else (forms, slot grid, confirmation, authentication, back-end API) is independent
of the map provider. That is why the map is isolated behind `MapAdapter` in this project.

## Out of scope

- Real booking back-end, e-mail sending, authentication.
- Routing (turn-by-turn). Options are listed in [02-api-mapping.md](02-api-mapping.md).

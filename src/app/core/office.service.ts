import { Injectable, signal } from '@angular/core';
import { LatLng, Office, Slot } from './models';

/** Fictional demo data. A real build swaps this for the back-end API (same shapes). */
const OFFICES: Office[] = [
  { id: 'par', name: 'Agence Paris Centre', address: '12 rue de Rivoli', city: 'Paris', position: { lat: 48.8559, lng: 2.3522 }, phone: '01 00 00 00 01', accessInfo: 'Step-free entrance on the courtyard side. Metro line 1, 2 min walk. No public parking on site.' },
  { id: 'lyo', name: 'Agence Lyon Part-Dieu', address: '8 cours Lafayette', city: 'Lyon', position: { lat: 45.7603, lng: 4.8544 }, phone: '04 00 00 00 02', accessInfo: 'Entrance next to the tram stop. Lift to the 2nd floor, reception on the left.' },
  { id: 'mrs', name: 'Agence Marseille Vieux-Port', address: '3 quai du Port', city: 'Marseille', position: { lat: 43.2951, lng: 5.3744 }, phone: '04 00 00 00 03' },
  { id: 'lil', name: 'Agence Lille Flandres', address: '21 rue Faidherbe', city: 'Lille', position: { lat: 50.6366, lng: 3.0707 }, phone: '03 00 00 00 04' },
  { id: 'bdx', name: 'Agence Bordeaux Saint-Jean', address: '5 rue Sainte-Catherine', city: 'Bordeaux', position: { lat: 44.8402, lng: -0.5744 }, phone: '05 00 00 00 05' },
  { id: 'nan', name: 'Agence Nantes Commerce', address: '14 rue Crébillon', city: 'Nantes', position: { lat: 47.2131, lng: -1.5593 }, phone: '02 00 00 00 06' },
  { id: 'str', name: 'Agence Strasbourg Kléber', address: '2 place Kléber', city: 'Strasbourg', position: { lat: 48.5846, lng: 7.7507 }, phone: '03 00 00 00 07' },
  { id: 'tls', name: 'Agence Toulouse Capitole', address: '9 rue du Taur', city: 'Toulouse', position: { lat: 43.6045, lng: 1.4442 }, phone: '05 00 00 00 08' },
];

/** Haversine distance in km. Replaces `google.maps.geometry.spherical.computeDistanceBetween`. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

@Injectable({ providedIn: 'root' })
export class OfficeService {
  readonly offices = signal<Office[]>(OFFICES);

  byId(id: string): Office | undefined {
    return OFFICES.find((o) => o.id === id);
  }

  /** Same offices, sorted by distance to `from` (nearest first). */
  nearest(from: LatLng): Office[] {
    return OFFICES.map((o) => ({ ...o, distanceKm: distanceKm(from, o.position) })).sort(
      (a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0),
    );
  }

  /** Deterministic fake availability: next 5 weekdays, every 30 min, 09:00-16:30. */
  slots(officeId: string): Slot[] {
    const out: Slot[] = [];
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    let added = 0;
    while (added < 5) {
      day.setDate(day.getDate() + 1);
      if (day.getDay() === 0 || day.getDay() === 6) continue;
      added++;
      for (let h = 9; h < 17; h++) {
        for (const m of [0, 30]) {
          const d = new Date(day);
          d.setHours(h, m);
          const id = `${officeId}-${d.getTime()}`;
          out.push({ id, officeId, start: d.toISOString(), available: (d.getTime() / 1_800_000 + officeId.length) % 3 !== 0 });
        }
      }
    }
    return out;
  }
}

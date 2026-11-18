import { Injectable, signal } from '@angular/core';
import { LatLng, Office, Slot } from './models';
import { around } from './surroundings';

const FACADE = {
  src: 'img/facade-exemple.svg',
  alt: 'Illustration d’exemple : façade d’une agence avec une porte vitrée à gauche et une enseigne bleue au-dessus.',
};

/** Fictional demo data. A real build swaps this for the back-end API (same shapes). */
const OFFICES: Office[] = [
  { id: 'par', name: 'Agence Paris Centre', address: '12 rue de Rivoli', postalCode: '75001', city: 'Paris', region: 'Île-de-France', country: 'France', position: { lat: 48.8559, lng: 2.3522 }, phone: '01 00 00 00 01', accessInfo: 'Entrée de plain-pied côté cour. Métro ligne 1 à 2 minutes à pied. Pas de parking public sur place.', photo: FACADE, surroundings: around('rue de Rivoli', 'rue du Louvre', 8, 'Métro') },
  { id: 'lyo', name: 'Agence Lyon Part-Dieu', address: '8 cours Lafayette', postalCode: '69003', city: 'Lyon', region: 'Auvergne-Rhône-Alpes', country: 'France', position: { lat: 45.7603, lng: 4.8544 }, phone: '04 00 00 00 02', accessInfo: 'Entrée à côté de l’arrêt de tram. Ascenseur jusqu’au 2e étage, accueil sur la gauche.', photo: FACADE, surroundings: around('cours Lafayette', 'rue Paul Bert', 80, 'Tram') },
  { id: 'mrs', name: 'Agence Marseille Vieux-Port', address: '3 quai du Port', postalCode: '13002', city: 'Marseille', region: 'Provence-Alpes-Côte d’Azur', country: 'France', position: { lat: 43.2951, lng: 5.3744 }, phone: '04 00 00 00 03', surroundings: around('quai du Port', 'rue de la République', 20, 'Métro') },
  { id: 'lil', name: 'Agence Lille Flandres', address: '21 rue Faidherbe', postalCode: '59000', city: 'Lille', region: 'Hauts-de-France', country: 'France', position: { lat: 50.6366, lng: 3.0707 }, phone: '03 00 00 00 04', surroundings: around('rue Faidherbe', 'rue de Béthune', 100, 'Métro') },
  { id: 'bdx', name: 'Agence Bordeaux Saint-Jean', address: '5 rue Sainte-Catherine', postalCode: '33000', city: 'Bordeaux', region: 'Nouvelle-Aquitaine', country: 'France', position: { lat: 44.8402, lng: -0.5744 }, phone: '05 00 00 00 05', surroundings: around('rue Sainte-Catherine', 'cours d’Alsace-et-Lorraine', -15, 'Tram') },
  { id: 'nan', name: 'Agence Nantes Commerce', address: '14 rue Crébillon', postalCode: '44000', city: 'Nantes', region: 'Pays de la Loire', country: 'France', position: { lat: 47.2131, lng: -1.5593 }, phone: '02 00 00 00 06', surroundings: around('rue Crébillon', 'rue de Strasbourg', 50, 'Tram') },
  { id: 'str', name: 'Agence Strasbourg Kléber', address: '2 place Kléber', postalCode: '67000', city: 'Strasbourg', region: 'Grand Est', country: 'France', position: { lat: 48.5846, lng: 7.7507 }, phone: '03 00 00 00 07', surroundings: around('place Kléber', 'rue des Grandes Arcades', 0, 'Tram') },
  { id: 'tls', name: 'Agence Toulouse Capitole', address: '9 rue du Taur', postalCode: '31000', city: 'Toulouse', region: 'Occitanie', country: 'France', position: { lat: 43.6045, lng: 1.4442 }, phone: '05 00 00 00 08', surroundings: around('rue du Taur', 'rue des Changes', 35, 'Métro') },
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

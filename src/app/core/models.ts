export interface LatLng {
  lat: number;
  lng: number;
}

export type LandmarkKind = 'post' | 'bakery' | 'townhall' | 'transport';

/** A useful place near an office. `dx`/`dy` are metres east/north of the office. */
export interface Landmark {
  kind: LandmarkKind;
  name: string;
  dx: number;
  dy: number;
}

/** A street segment near an office, in metres east/north of the office. */
export interface Street {
  name: string;
  from: [number, number];
  to: [number, number];
  main?: boolean;
}

/**
 * Data for the schematic plan around an office. In production this comes from OpenStreetMap,
 * prepared on the server side (never fetched from the citizen's browser).
 */
export interface Surroundings {
  streets: Street[];
  landmarks: Landmark[];
}

/** A place where an appointment can be booked. Provider-agnostic: no map-library type leaks here. */
export interface Office {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  position: LatLng;
  phone: string;
  surroundings?: Surroundings;
  /** Practical arrival info: entrance, step-free route, transport, parking. */
  accessInfo?: string;
  /** Photo of the facade/entrance. `alt` is mandatory (RGAA 1.1). Hosted on our own origin. */
  photo?: { src: string; alt: string };
  /** Filled in by the "near me / near this address" search. */
  distanceKm?: number;
}

export interface Slot {
  id: string;
  officeId: string;
  /** ISO 8601 local date-time. */
  start: string;
  available: boolean;
}

export interface Booking {
  office: Office;
  slot: Slot;
  fullName: string;
  email: string;
  reference: string;
}

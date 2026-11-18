export interface LatLng {
  lat: number;
  lng: number;
}

/** A place where an appointment can be booked. Provider-agnostic: no map-library type leaks here. */
export interface Office {
  id: string;
  name: string;
  address: string;
  city: string;
  position: LatLng;
  phone: string;
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

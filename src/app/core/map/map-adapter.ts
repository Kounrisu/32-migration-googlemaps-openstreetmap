import { LatLng } from '../models';

export interface MapMarker {
  id: string;
  position: LatLng;
  /** Accessible name; also used as the marker tooltip. */
  label: string;
}

/**
 * The ONLY map surface the rest of the app knows about.
 *
 * Components depend on this interface; `LeafletMapAdapter` (OpenStreetMap) and
 * `GoogleMapAdapter` are the only files importing a map SDK. Choosing which one runs is a
 * config switch (`mapProvider`), which is also the rollback path of the migration.
 */
export interface MapAdapter {
  /** May load an SDK over the network, hence async. */
  init(container: HTMLElement): void | Promise<void>;
  setMarkers(markers: MapMarker[]): void;
  highlight(id: string | null): void;
  flyTo(position: LatLng, zoom?: number): void;
  fitTo(positions: LatLng[]): void;
  setUserPosition(position: LatLng | null): void;
  onMarkerClick(handler: (id: string) => void): void;
  destroy(): void;
}

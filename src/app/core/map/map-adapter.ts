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
 * Google Maps -> OpenStreetMap is the migration at hand, but the same seam makes the next
 * change (MapLibre vector tiles, a sovereign tile provider...) a one-file swap instead of a
 * rewrite. Components depend on this interface; `LeafletMapAdapter` is the single place that
 * imports `leaflet`.
 */
export interface MapAdapter {
  init(container: HTMLElement): void;
  setMarkers(markers: MapMarker[]): void;
  highlight(id: string | null): void;
  flyTo(position: LatLng, zoom?: number): void;
  fitTo(positions: LatLng[]): void;
  setUserPosition(position: LatLng | null): void;
  onMarkerClick(handler: (id: string) => void): void;
  destroy(): void;
}

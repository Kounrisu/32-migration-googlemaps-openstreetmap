import { AppConfig } from '../config';
import { LatLng } from '../models';
import { MapAdapter, MapMarker } from './map-adapter';

let sdk: Promise<void> | undefined;

/**
 * Loads the Google Maps JS SDK once, only when the Google provider is actually used.
 * With `mapProvider: "osm"` no request to Google is ever made (checked in docs/06).
 */
function loadGoogleSdk(apiKey: string): Promise<void> {
  sdk ??= new Promise<void>((resolve, reject) => {
    const params = new URLSearchParams({ loading: 'async', v: 'weekly', callback: '__gmapsReady' });
    if (apiKey) params.set('key', apiKey);
    (window as unknown as Record<string, unknown>)['__gmapsReady'] = () => resolve();
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => {
      sdk = undefined;
      reject(new Error('Google Maps SDK could not be loaded'));
    };
    document.head.appendChild(script);
  });
  return sdk;
}

/** Same pin shape/colours as the Leaflet CSS pin, as an SVG data URL. */
function pinIcon(color: string, size: number): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 1C7 1 2 6 2 13c0 9 12 22 12 22s12-13 12-22C26 6 21 1 14 1z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="14" cy="13" r="4" fill="#fff"/></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, (size * 36) / 28),
    anchor: new google.maps.Point(size / 2, (size * 36) / 28),
  };
}

/**
 * Google implementation of `MapAdapter`: same contract as the Leaflet one, different SDK.
 *
 * It uses a standard (raster) map with `google.maps.Marker`: no Map ID needed, which matters on a
 * fresh or demo Cloud project. `Marker` is deprecated by Google in favour of
 * `AdvancedMarkerElement` (which requires a Map ID created in Cloud Console); see docs/02.
 */
export class GoogleMapAdapter implements MapAdapter {
  private map?: google.maps.Map;
  private markers = new Map<string, google.maps.Marker>();
  private user?: google.maps.Marker;
  private clickHandler: (id: string) => void = () => undefined;

  constructor(private readonly config: AppConfig) {}

  async init(container: HTMLElement): Promise<void> {
    await loadGoogleSdk(this.config.googleApiKey);
    const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    const [lat, lng] = this.config.defaultCenter;
    this.map = new Map(container, {
      center: { lat, lng },
      zoom: this.config.defaultZoom,
      keyboardShortcuts: true,
    });
  }

  setMarkers(markers: MapMarker[]): void {
    this.markers.forEach((m) => m.setMap(null));
    this.markers.clear();
    for (const m of markers) {
      const marker = new google.maps.Marker({
        map: this.map,
        position: m.position,
        title: m.label,
        icon: pinIcon('#1d4ed8', 28),
      });
      marker.addListener('click', () => this.clickHandler(m.id));
      this.markers.set(m.id, marker);
    }
  }

  highlight(id: string | null): void {
    this.markers.forEach((marker, key) => {
      const selected = key === id;
      marker.setIcon(pinIcon(selected ? '#dc2626' : '#1d4ed8', selected ? 36 : 28));
      marker.setZIndex(selected ? 1000 : 0);
    });
  }

  flyTo(position: LatLng, zoom = 14): void {
    this.map?.panTo(position);
    this.map?.setZoom(zoom);
  }

  fitTo(positions: LatLng[]): void {
    if (!this.map || positions.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    positions.forEach((p) => bounds.extend(p));
    this.map.fitBounds(bounds, 32);
  }

  setUserPosition(position: LatLng | null): void {
    this.user?.setMap(null);
    this.user = undefined;
    if (position && this.map) {
      this.user = new google.maps.Marker({
        map: this.map,
        position,
        title: 'Your position',
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#16a34a', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 },
      });
    }
  }

  onMarkerClick(handler: (id: string) => void): void {
    this.clickHandler = handler;
  }

  destroy(): void {
    this.markers.forEach((m) => m.setMap(null));
    this.markers.clear();
    this.user?.setMap(null);
    this.map = undefined;
  }
}

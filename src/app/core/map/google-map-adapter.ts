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
    const params = new URLSearchParams({ loading: 'async', libraries: 'marker', v: 'weekly', callback: '__gmapsReady' });
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

/** Google implementation of `MapAdapter`: same contract as the Leaflet one, different SDK. */
export class GoogleMapAdapter implements MapAdapter {
  private map?: google.maps.Map;
  private markers = new Map<string, google.maps.marker.AdvancedMarkerElement>();
  private user?: google.maps.marker.AdvancedMarkerElement;
  private clickHandler: (id: string) => void = () => undefined;

  constructor(private readonly config: AppConfig) {}

  async init(container: HTMLElement): Promise<void> {
    await loadGoogleSdk(this.config.googleApiKey);
    const { Map } = (await google.maps.importLibrary('maps')) as google.maps.MapsLibrary;
    await google.maps.importLibrary('marker');
    const [lat, lng] = this.config.defaultCenter;
    this.map = new Map(container, {
      center: { lat, lng },
      zoom: this.config.defaultZoom,
      mapId: this.config.googleMapId,
      keyboardShortcuts: true,
    });
  }

  setMarkers(markers: MapMarker[]): void {
    this.markers.forEach((m) => (m.map = null));
    this.markers.clear();
    for (const m of markers) {
      const content = document.createElement('div');
      content.className = 'office-pin';
      content.appendChild(document.createElement('span'));
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: this.map,
        position: m.position,
        title: m.label,
        content,
        gmpClickable: true,
      });
      marker.addListener('click', () => this.clickHandler(m.id));
      this.markers.set(m.id, marker);
    }
  }

  highlight(id: string | null): void {
    this.markers.forEach((marker, key) => {
      (marker.content as HTMLElement).classList.toggle('is-selected', key === id);
      marker.zIndex = key === id ? 1000 : 0;
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
    if (this.user) this.user.map = null;
    this.user = undefined;
    if (position && this.map) {
      const dot = document.createElement('div');
      dot.className = 'user-dot-html';
      this.user = new google.maps.marker.AdvancedMarkerElement({ map: this.map, position, content: dot, title: 'Your position' });
    }
  }

  onMarkerClick(handler: (id: string) => void): void {
    this.clickHandler = handler;
  }

  destroy(): void {
    this.markers.forEach((m) => (m.map = null));
    this.markers.clear();
    if (this.user) this.user.map = null;
    this.map = undefined;
  }
}

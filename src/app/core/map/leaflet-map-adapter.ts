import * as L from 'leaflet';
import { AppConfig } from '../config';
import { LatLng } from '../models';
import { MapAdapter, MapMarker } from './map-adapter';

/**
 * Leaflet implementation. Markers use `L.divIcon` (pure CSS) instead of the default PNG icons:
 * the classic Leaflet + bundler pitfall of broken marker image paths simply disappears, and no
 * binary asset has to be shipped.
 */
export class LeafletMapAdapter implements MapAdapter {
  private map?: L.Map;
  private layer = L.layerGroup();
  private markers = new Map<string, L.Marker>();
  private user?: L.CircleMarker;
  private clickHandler: (id: string) => void = () => undefined;

  constructor(private readonly config: AppConfig) {}

  init(container: HTMLElement): void {
    this.map = L.map(container, {
      center: this.config.defaultCenter,
      zoom: this.config.defaultZoom,
      // Keyboard navigation (arrows, +/-) stays on: required for RGAA/WCAG, see docs/04.
      keyboard: true,
    });
    L.tileLayer(this.config.tileUrl, {
      maxZoom: this.config.tileMaxZoom,
      attribution: this.config.tileAttribution,
    }).addTo(this.map);
    this.layer.addTo(this.map);
  }

  setMarkers(markers: MapMarker[]): void {
    this.layer.clearLayers();
    this.markers.clear();
    for (const m of markers) {
      const marker = L.marker([m.position.lat, m.position.lng], {
        title: m.label,
        alt: m.label,
        keyboard: true,
        icon: L.divIcon({ className: 'office-pin', html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 28] }),
      });
      marker.on('click', () => this.clickHandler(m.id));
      marker.addTo(this.layer);
      this.markers.set(m.id, marker);
    }
  }

  highlight(id: string | null): void {
    this.markers.forEach((marker, key) => {
      marker.getElement()?.classList.toggle('is-selected', key === id);
      marker.setZIndexOffset(key === id ? 1000 : 0);
    });
  }

  flyTo(position: LatLng, zoom = 14): void {
    this.map?.flyTo([position.lat, position.lng], zoom, { duration: 0.6 });
  }

  fitTo(positions: LatLng[]): void {
    if (!this.map || positions.length === 0) return;
    this.map.fitBounds(L.latLngBounds(positions.map((p) => [p.lat, p.lng] as [number, number])), {
      padding: [32, 32],
      maxZoom: 14,
    });
  }

  setUserPosition(position: LatLng | null): void {
    this.user?.remove();
    this.user = undefined;
    if (position && this.map) {
      this.user = L.circleMarker([position.lat, position.lng], { radius: 8, className: 'user-dot' }).addTo(this.map);
    }
  }

  onMarkerClick(handler: (id: string) => void): void {
    this.clickHandler = handler;
  }

  destroy(): void {
    this.map?.remove();
    this.map = undefined;
    this.markers.clear();
  }
}

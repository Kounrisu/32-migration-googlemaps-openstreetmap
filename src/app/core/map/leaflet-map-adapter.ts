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
  private resizer?: ResizeObserver;
  private fitted: LatLng[] = [];
  private refitDone = false;
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
    // The container may be laid out after the map is created (flex/grid, lazy route): re-measure
    // whenever its size changes, otherwise fitBounds computes a zoom for a 0 px map.
    this.resizer = new ResizeObserver(() => {
      this.map?.invalidateSize();
      if (!this.refitDone && container.clientHeight > 0 && this.fitted.length) {
        this.refitDone = true;
        this.fitTo(this.fitted);
      }
    });
    this.resizer.observe(container);
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
    this.fitted = positions;
    this.map.invalidateSize();
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

  onMapClick(handler: (position: LatLng) => void): void {
    // Marker clicks do not bubble to the map in Leaflet, so this only fires on empty ground.
    this.map?.on('click', (e: L.LeafletMouseEvent) => handler({ lat: e.latlng.lat, lng: e.latlng.lng }));
  }

  destroy(): void {
    this.resizer?.disconnect();
    this.map?.remove();
    this.map = undefined;
    this.markers.clear();
  }
}

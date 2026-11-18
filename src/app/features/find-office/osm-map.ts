import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, effect, inject, input, output, viewChild } from '@angular/core';
import { ConfigService } from '../../core/config';
import { LatLng, Office } from '../../core/models';
import { LeafletMapAdapter } from '../../core/map/leaflet-map-adapter';
import { MapAdapter } from '../../core/map/map-adapter';

/**
 * Thin Angular wrapper around a `MapAdapter`. Replaces the `<google-map>` / `<map-marker>` pair.
 * It is decorative-redundant: everything on the map is also in the office list next to it
 * (see docs/04-accessibility-and-privacy.md), so the map has no information of its own.
 */
@Component({
  selector: 'app-osm-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #host class="map" role="application" aria-label="Map of offices. The same offices are listed beside the map."></div>`,
  styles: `
    :host { display: block; height: 100%; min-height: 320px; }
    .map { height: 100%; min-height: 320px; border-radius: 8px; }
  `,
})
export class OsmMap implements OnDestroy {
  readonly offices = input.required<Office[]>();
  readonly selectedId = input<string | null>(null);
  readonly user = input<LatLng | null>(null);
  readonly officeSelected = output<string>();

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly adapter: MapAdapter = new LeafletMapAdapter(inject(ConfigService).config);
  private ready = false;

  constructor() {
    effect(() => {
      const el = this.host().nativeElement;
      if (!this.ready) {
        this.adapter.init(el);
        this.adapter.onMarkerClick((id) => this.officeSelected.emit(id));
        this.ready = true;
      }
      const offices = this.offices();
      this.adapter.setMarkers(offices.map((o) => ({ id: o.id, position: o.position, label: `${o.name}, ${o.city}` })));
      this.adapter.fitTo(offices.map((o) => o.position));
    });
    effect(() => {
      const id = this.selectedId();
      this.adapter.highlight(id);
      const office = this.offices().find((o) => o.id === id);
      if (office) this.adapter.flyTo(office.position);
    });
    effect(() => this.adapter.setUserPosition(this.user()));
  }

  ngOnDestroy(): void {
    this.adapter.destroy();
  }
}

import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { ConfigService, MapProvider } from '../../core/config';
import { LatLng, Office } from '../../core/models';
import { createMapAdapter } from '../../core/map/create-map-adapter';
import { MapAdapter } from '../../core/map/map-adapter';

/**
 * Provider-agnostic map component. Replaces the `<google-map>` / `<map-marker>` pair.
 * `provider` defaults to `mapProvider` from config.json; the compare page overrides it to show
 * both side by side. Everything on the map is also in the office table, so the map carries no
 * information of its own (docs/04-accessibility-and-privacy.md).
 */
@Component({
  selector: 'app-office-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #host class="map" role="region" [attr.aria-label]="'Carte des agences (' + resolved + '). Les mêmes agences sont dans le tableau.'"></div>
    @if (error()) { <p class="err" role="alert">{{ error() }}</p> }
  `,
  styles: `
    :host { display: block; position: relative; height: 100%; min-height: 280px; }
    .map { height: 100%; min-height: 280px; border-radius: 8px; }
    .err { position: absolute; inset: auto 8px 8px 8px; background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; border-radius: 6px; padding: 8px; margin: 0; z-index: 1000; }
  `,
})
export class OfficeMap {
  readonly offices = input.required<Office[]>();
  readonly selectedId = input<string | null>(null);
  readonly user = input<LatLng | null>(null);
  readonly provider = input<MapProvider | undefined>(undefined);
  readonly officeSelected = output<string>();
  /** A click on empty ground: the citizen tells us where they are. */
  readonly pointPicked = output<LatLng>();

  protected readonly error = signal('');
  private readonly cfg = inject(ConfigService);
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private readonly ready = signal(false);
  private adapter?: MapAdapter;
  private destroyed = false;

  protected get resolved(): string {
    return (this.provider() ?? this.cfg.config.mapProvider) === 'google' ? 'Google' : 'OpenStreetMap';
  }

  constructor() {
    afterNextRender(() => void this.start());
    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.adapter?.destroy();
    });

    effect(() => {
      if (!this.ready()) return;
      const offices = this.offices();
      this.adapter!.setMarkers(offices.map((o) => ({ id: o.id, position: o.position, label: `${o.name}, ${o.city}` })));
      this.adapter!.fitTo(offices.map((o) => o.position));
      this.adapter!.highlight(this.selectedId());
    });
    effect(() => {
      if (!this.ready()) return;
      const id = this.selectedId();
      this.adapter!.highlight(id);
      const office = this.offices().find((o) => o.id === id);
      if (office) this.adapter!.flyTo(office.position);
    });
    effect(() => {
      if (this.ready()) this.adapter!.setUserPosition(this.user());
    });
  }

  private async start(): Promise<void> {
    const adapter = createMapAdapter(this.provider() ?? this.cfg.config.mapProvider, this.cfg.config);
    try {
      await adapter.init(this.host().nativeElement);
    } catch {
      this.error.set(`La carte ${this.resolved} n’a pas pu être chargée. Le tableau des agences fonctionne toujours.`);
      return;
    }
    if (this.destroyed) return adapter.destroy();
    adapter.onMarkerClick((id) => this.officeSelected.emit(id));
    adapter.onMapClick((p) => this.pointPicked.emit(p));
    this.adapter = adapter;
    this.ready.set(true);
  }
}

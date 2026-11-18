import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Geocoder, GeocodeResult } from '../../core/geocoding/geocoder';
import { distanceLabel } from '../../core/geo';
import { LatLng, Office } from '../../core/models';
import { NavAppId, defaultNavApp, navigationLinks } from '../../core/navigation-links';
import { citiesOf, countriesOf, filterOffices, regionsOf } from '../../core/office-filter';
import { OfficeService } from '../../core/office.service';
import { OfficeMap } from './office-map';
import { OfficeSketch } from './office-sketch';

const NAV_APP_KEY = 'navApp';
const NAV_APPS: NavAppId[] = ['android', 'apple', 'google', 'bing', 'windows', 'waze', 'osm'];

@Component({
  selector: 'app-find-office',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, OfficeMap, OfficeSketch],
  templateUrl: './find-office.html',
  styleUrl: './find-office.css',
})
export class FindOffice {
  private readonly offices = inject(OfficeService);
  private readonly geocoder = inject(Geocoder);
  private readonly injector = inject(Injector);

  protected readonly query = signal('');
  protected readonly suggestions = signal<GeocodeResult[]>([]);
  protected readonly origin = signal<LatLng | null>(null);
  protected readonly originLabel = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly status = signal('');

  protected readonly country = signal('');
  protected readonly region = signal('');
  protected readonly city = signal('');

  /** The map is optional and only loaded on request: lighter for weak networks and old devices. */
  protected readonly showMap = signal(false);
  protected readonly bigMap = signal(false);
  protected readonly navApp = signal<NavAppId>(this.readNavApp());

  private readonly agencyTitle = viewChild<ElementRef<HTMLElement>>('agencyTitle');
  private readonly mapTitle = viewChild<ElementRef<HTMLElement>>('mapTitle');

  private readonly all = this.offices.offices;
  protected readonly countries = computed(() => countriesOf(this.all()));
  protected readonly regions = computed(() => regionsOf(this.all(), this.country()));
  protected readonly cities = computed(() => citiesOf(this.all(), this.country(), this.region()));
  protected readonly filtersActive = computed(() => !!(this.country() || this.region() || this.city()));

  /** Sorted by distance when we know where the person is, otherwise by city; then filtered. */
  protected readonly list = computed(() => {
    const from = this.origin();
    const base = from ? this.offices.nearest(from) : [...this.all()].sort((a, b) => a.city.localeCompare(b.city, 'fr'));
    return filterOffices(base, { country: this.country(), region: this.region(), city: this.city() });
  });

  protected readonly selected = computed(() => this.list().find((o) => o.id === this.selectedId()) ?? null);
  protected readonly isNearest = computed(() => !!this.origin() && this.list()[0]?.id === this.selectedId());
  protected readonly navLinks = computed(() => {
    const o = this.selected();
    return o ? navigationLinks(o) : [];
  });
  protected readonly chosenLink = computed(() => this.navLinks().find((l) => l.id === this.navApp()) ?? this.navLinks()[0]);

  protected distance(o: Office): string {
    return o.distanceKm === undefined ? '' : distanceLabel(o.distanceKm * 1000);
  }

  protected phoneHref(o: Office): string {
    return o.phone.replace(/\s+/g, '');
  }

  protected async search(): Promise<void> {
    if (this.query().trim().length < 3) {
      this.status.set('Saisissez au moins 3 caractères : une adresse, un code postal ou une ville.');
      return;
    }
    this.status.set('Recherche en cours…');
    try {
      const results = await this.geocoder.search(this.query());
      if (!results.length) {
        this.suggestions.set([]);
        this.status.set('Aucune adresse trouvée. Vérifiez l’orthographe ou essayez avec le code postal.');
        return;
      }
      this.pick(results[0]);
      this.suggestions.set(results.slice(1));
    } catch {
      this.status.set('La recherche d’adresse est indisponible. Vous pouvez choisir une agence dans le tableau ci-dessous.');
    }
  }

  protected pick(result: GeocodeResult): void {
    this.suggestions.set([]);
    this.query.set(result.label);
    this.setOrigin(result.position, result.label);
  }

  protected locate(): void {
    if (!navigator.geolocation) {
      this.status.set('La localisation n’est pas disponible sur cet appareil. Saisissez une adresse.');
      return;
    }
    this.status.set('Localisation en cours…');
    // Only called on an explicit click: no silent permission prompt, no tracking.
    navigator.geolocation.getCurrentPosition(
      (p) => this.setOrigin({ lat: p.coords.latitude, lng: p.coords.longitude }, 'votre position'),
      () => this.status.set('Position refusée ou indisponible. Saisissez une adresse, ou cliquez sur la carte.'),
    );
  }

  protected onPointPicked(p: LatLng): void {
    this.suggestions.set([]);
    this.query.set('');
    this.setOrigin(p, 'le point choisi sur la carte');
  }

  /** Shared by address search, device position and map click. */
  private setOrigin(position: LatLng, label: string): void {
    this.clearFilters();
    this.origin.set(position);
    this.originLabel.set(label);
    const nearest = this.list()[0];
    this.selectedId.set(nearest?.id ?? null);
    this.status.set(nearest ? `Agence la plus proche : ${nearest.name}, à ${this.distance(nearest)}.` : 'Aucune agence trouvée.');
  }

  /** From the table: pick an agency and move focus to its details (RGAA 12.8, no lost context). */
  protected choose(id: string): void {
    this.selectedId.set(id);
    afterNextRender(() => this.agencyTitle()?.nativeElement.focus(), { injector: this.injector });
  }

  /** From a map pin: keep focus on the map, announce the choice instead. */
  protected onMarker(id: string): void {
    this.selectedId.set(id);
    const o = this.all().find((x) => x.id === id);
    if (o) this.status.set(`Agence choisie : ${o.name}. Ses détails sont affichés plus haut dans la page.`);
  }

  protected openMap(pick: boolean): void {
    this.showMap.set(true);
    if (pick) this.status.set('Cliquez sur la carte à l’endroit où vous êtes.');
    afterNextRender(() => this.mapTitle()?.nativeElement.focus(), { injector: this.injector });
  }

  protected setCountry(v: string): void {
    this.country.set(v);
    if (this.region() && !this.regions().includes(this.region())) this.region.set('');
    if (this.city() && !this.cities().includes(this.city())) this.city.set('');
  }

  protected setRegion(v: string): void {
    this.region.set(v);
    if (this.city() && !this.cities().includes(this.city())) this.city.set('');
  }

  protected clearFilters(): void {
    this.country.set('');
    this.region.set('');
    this.city.set('');
  }

  protected setNavApp(id: string): void {
    if (!NAV_APPS.includes(id as NavAppId)) return;
    this.navApp.set(id as NavAppId);
    try {
      // Purely functional preference, kept on this device only and never sent anywhere.
      localStorage.setItem(NAV_APP_KEY, id);
    } catch {
      /* private mode: the choice just is not remembered */
    }
  }

  private readNavApp(): NavAppId {
    try {
      const stored = localStorage.getItem(NAV_APP_KEY);
      if (stored && NAV_APPS.includes(stored as NavAppId)) return stored as NavAppId;
    } catch {
      /* ignore */
    }
    return defaultNavApp(navigator.userAgent);
  }
}

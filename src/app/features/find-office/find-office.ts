import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Geocoder, GeocodeResult } from '../../core/geocoding/geocoder';
import { LatLng } from '../../core/models';
import { navigationLinks } from '../../core/navigation-links';
import { OfficeService } from '../../core/office.service';
import { OfficeMap } from './office-map';

@Component({
  selector: 'app-find-office',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, OfficeMap],
  templateUrl: './find-office.html',
  styleUrl: './find-office.css',
})
export class FindOffice {
  private readonly offices = inject(OfficeService);
  private readonly geocoder = inject(Geocoder);

  protected readonly query = signal('');
  protected readonly suggestions = signal<GeocodeResult[]>([]);
  protected readonly origin = signal<LatLng | null>(null);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly status = signal('');

  protected readonly list = computed(() => {
    const from = this.origin();
    return from ? this.offices.nearest(from) : this.offices.offices();
  });

  protected readonly selected = computed(() => this.list().find((o) => o.id === this.selectedId()) ?? null);
  protected readonly links = computed(() => {
    const o = this.selected();
    return o ? navigationLinks(o) : [];
  });

  protected async search(): Promise<void> {
    this.status.set('');
    try {
      const results = await this.geocoder.search(this.query());
      this.suggestions.set(results);
      this.status.set(results.length ? `${results.length} address(es) found` : 'No address found');
    } catch {
      this.status.set('Address search is unavailable, please try again later.');
    }
  }

  protected pick(result: GeocodeResult): void {
    this.origin.set(result.position);
    this.query.set(result.label);
    this.suggestions.set([]);
    this.selectedId.set(this.offices.nearest(result.position)[0].id);
    this.status.set('Offices sorted by distance');
  }

  protected locate(): void {
    if (!navigator.geolocation) {
      this.status.set('Geolocation is not available in this browser.');
      return;
    }
    // Only called on an explicit click: no silent permission prompt, no tracking.
    navigator.geolocation.getCurrentPosition(
      (p) => {
        this.origin.set({ lat: p.coords.latitude, lng: p.coords.longitude });
        this.selectedId.set(this.offices.nearest(this.origin()!)[0].id);
        this.status.set('Offices sorted by distance from your position');
      },
      () => this.status.set('Position refused or unavailable. Type an address instead.'),
    );
  }
}

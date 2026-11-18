import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ConfigService } from '../../core/config';
import { OfficeService } from '../../core/office.service';
import { OfficeMap } from '../find-office/office-map';

/** Same offices, same selection, two providers: the visual proof for the PoC. */
@Component({
  selector: 'app-compare',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OfficeMap],
  template: `
    <h1>Google Maps et OpenStreetMap</h1>
    <p class="lead">Mêmes données, même interface d’adaptateur. Cliquez sur une épingle de l’une ou l’autre carte : les deux suivent.</p>
    @if (!hasKey) {
      <p class="note" role="note">
        Aucune clé d’API Google trouvée : la carte Google fonctionne en mode « développement uniquement ».
        Mettez une clé dans <code>public/config.local.json</code> (voir le README) pour la voir comme en production.
      </p>
    }
    <div class="pair">
      <section aria-label="Google Maps">
        <h2>Google Maps</h2>
        <app-office-map provider="google" [offices]="offices.offices()" [selectedId]="selected()" (officeSelected)="selected.set($event)" />
      </section>
      <section aria-label="OpenStreetMap">
        <h2>OpenStreetMap (Leaflet)</h2>
        <app-office-map provider="osm" [offices]="offices.offices()" [selectedId]="selected()" (officeSelected)="selected.set($event)" />
      </section>
    </div>
  `,
  styles: `
    .lead { color: #475569; margin-top: 0; }
    .note { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 8px 12px; }
    .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    section { height: 520px; display: flex; flex-direction: column; }
    h2 { font-size: 1rem; margin: 0 0 6px; }
    app-office-map { flex: 1; }
    @media (max-width: 760px) { .pair { grid-template-columns: 1fr; } }
  `,
})
export class Compare {
  protected readonly offices = inject(OfficeService);
  protected readonly selected = signal<string | null>(null);
  protected readonly hasKey = !!inject(ConfigService).config.googleApiKey;
}

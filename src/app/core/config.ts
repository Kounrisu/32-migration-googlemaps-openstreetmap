import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/**
 * Runtime configuration, loaded from `/config.json` BEFORE the app boots.
 *
 * Why runtime and not `environment.ts`: the same container image / static bundle must be
 * promotable between environments of a cloud platform (dev → staging → prod) without a
 * rebuild. The platform only has to mount or template one small JSON file.
 */
export interface AppConfig {
  /** Raster tile endpoint. Production MUST NOT point at tile.openstreetmap.org (see docs/03). */
  tileUrl: string;
  tileAttribution: string;
  tileMaxZoom: number;
  /** `ban` (api-adresse.data.gouv.fr) or `nominatim`. Both can be re-pointed to a self-hosted base URL. */
  geocoder: 'ban' | 'nominatim';
  geocoderBaseUrl: string;
  /** Initial map view (France mainland). */
  defaultCenter: [number, number];
  defaultZoom: number;
}

const FALLBACK: AppConfig = {
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  tileMaxZoom: 19,
  geocoder: 'ban',
  geocoderBaseUrl: 'https://api-adresse.data.gouv.fr',
  defaultCenter: [46.6, 2.4],
  defaultZoom: 6,
};

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);
  private value: AppConfig = FALLBACK;

  get config(): AppConfig {
    return this.value;
  }

  async load(): Promise<void> {
    try {
      const loaded = await firstValueFrom(this.http.get<Partial<AppConfig>>('config.json'));
      this.value = { ...FALLBACK, ...loaded };
    } catch {
      // Keep the fallback: a missing config file must not take the whole front down.
      console.warn('config.json not found, using built-in defaults');
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type MapProvider = 'osm' | 'google';

/**
 * Runtime configuration, loaded from `/config.json` BEFORE the app boots.
 *
 * Why runtime and not `environment.ts`: the same container image / static bundle must be
 * promotable between environments of a cloud platform (dev -> staging -> prod) without a
 * rebuild. The platform only has to mount or template one small JSON file.
 *
 * `/config.local.json` (gitignored, optional) is merged on top: that is where a developer puts
 * the Google API key. It must never be committed (the repo is public).
 */
export interface AppConfig {
  /** Which map the app uses. Flip to roll back or to compare. */
  mapProvider: MapProvider;
  /** Google only. Leave empty to see Google's "development purposes only" mode. */
  googleApiKey: string;
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
  mapProvider: 'osm',
  googleApiKey: '',
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
    this.value = { ...FALLBACK, ...(await this.read('config.json')), ...(await this.read('config.local.json')) };
  }

  private async read(file: string): Promise<Partial<AppConfig>> {
    try {
      const body = await firstValueFrom(this.http.get<Partial<AppConfig>>(file));
      return body && typeof body === 'object' ? body : {};
    } catch {
      // A missing file (or an SPA fallback page instead of JSON) must not take the front down.
      return {};
    }
  }
}


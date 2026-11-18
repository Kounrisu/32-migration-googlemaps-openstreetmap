import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config';
import { LatLng } from '../models';

export interface GeocodeResult {
  label: string;
  position: LatLng;
}

/**
 * Replaces `google.maps.Geocoder` / Places Autocomplete.
 *
 * Two interchangeable back-ends, chosen in config.json:
 *  - `ban`       : French national address base (api-adresse.data.gouv.fr). Free, no key, built
 *                  for French addresses, hosted in France, and self-hostable.
 *  - `nominatim` : OSM geocoder. Strict public usage policy (max 1 req/s, no autocomplete-as-you-type
 *                  against the public instance): self-host it for production.
 */
@Injectable({ providedIn: 'root' })
export class Geocoder {
  private readonly http = inject(HttpClient);
  private readonly cfg = inject(ConfigService);

  async search(query: string): Promise<GeocodeResult[]> {
    const q = query.trim();
    if (q.length < 3) return [];
    const { geocoder, geocoderBaseUrl } = this.cfg.config;
    return geocoder === 'ban' ? this.ban(geocoderBaseUrl, q) : this.nominatim(geocoderBaseUrl, q);
  }

  private async ban(base: string, q: string): Promise<GeocodeResult[]> {
    const res = await firstValueFrom(
      this.http.get<{ features: { geometry: { coordinates: [number, number] }; properties: { label: string } }[] }>(
        `${base}/search/`,
        { params: { q, limit: 5 } },
      ),
    );
    return res.features.map((f) => ({
      label: f.properties.label,
      position: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
    }));
  }

  private async nominatim(base: string, q: string): Promise<GeocodeResult[]> {
    const res = await firstValueFrom(
      this.http.get<{ display_name: string; lat: string; lon: string }[]>(`${base}/search`, {
        params: { q, format: 'jsonv2', limit: 5, countrycodes: 'fr' },
      }),
    );
    return res.map((r) => ({ label: r.display_name, position: { lat: +r.lat, lng: +r.lon } }));
  }
}

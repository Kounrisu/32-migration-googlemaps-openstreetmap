import { AppConfig, MapProvider } from '../config';
import { GoogleMapAdapter } from './google-map-adapter';
import { LeafletMapAdapter } from './leaflet-map-adapter';
import { MapAdapter } from './map-adapter';

/** The one place that knows both implementations. */
export function createMapAdapter(provider: MapProvider, config: AppConfig): MapAdapter {
  return provider === 'google' ? new GoogleMapAdapter(config) : new LeafletMapAdapter(config);
}

import { Office } from './models';

export type NavAppId = 'android' | 'apple' | 'google' | 'bing' | 'windows' | 'waze' | 'osm';

export interface NavLink {
  id: NavAppId;
  label: string;
  href: string;
}

/**
 * Hand-off to the person's own GPS app. No routing API, no key, no tracking: nothing is sent to
 * any provider until the person clicks one of these links.
 */
export function navigationLinks(office: Office): NavLink[] {
  const dest = `${office.position.lat},${office.position.lng}`;
  const name = encodeURIComponent(office.name);
  // Microsoft's route syntax separates lat, lng and name with underscores, so none may remain
  // in the name itself.
  const msPoint = `${office.position.lat}_${office.position.lng}_${encodeURIComponent(office.name.replace(/_/g, ' '))}`;
  return [
    { id: 'android', label: 'Android (application de navigation)', href: `geo:${dest}?q=${dest}(${name})` },
    { id: 'apple', label: 'Apple Plans', href: `https://maps.apple.com/?daddr=${dest}&dirflg=d` },
    { id: 'google', label: 'Google Maps', href: `https://www.google.com/maps/dir/?api=1&destination=${dest}` },
    { id: 'bing', label: 'Microsoft Bing Maps (site web)', href: `https://www.bing.com/maps?rtp=~pos.${msPoint}` },
    { id: 'windows', label: 'Windows Cartes (application)', href: `bingmaps:?rtp=~pos.${msPoint}` },
    { id: 'waze', label: 'Waze', href: `https://waze.com/ul?ll=${dest}&navigate=yes` },
    { id: 'osm', label: 'OpenStreetMap (site web)', href: `https://www.openstreetmap.org/directions?to=${dest}` },
  ];
}

/** First guess for the "my navigation app" choice, from the device. Only stored if the user picks. */
export function defaultNavApp(userAgent: string): NavAppId {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'apple';
  if (/Android/i.test(userAgent)) return 'android';
  if (/Windows/i.test(userAgent)) return 'bing';
  return 'osm';
}

import { Office } from './models';

export interface NavLink {
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
    { label: 'Android navigation app', href: `geo:${dest}?q=${dest}(${name})` },
    { label: 'Apple Plans', href: `https://maps.apple.com/?daddr=${dest}&dirflg=d` },
    { label: 'Google Maps', href: `https://www.google.com/maps/dir/?api=1&destination=${dest}` },
    { label: 'Microsoft Bing Maps (web)', href: `https://www.bing.com/maps?rtp=~pos.${msPoint}` },
    { label: 'Windows Maps app', href: `bingmaps:?rtp=~pos.${msPoint}` },
    { label: 'Waze', href: `https://waze.com/ul?ll=${dest}&navigate=yes` },
    { label: 'OpenStreetMap', href: `https://www.openstreetmap.org/directions?to=${dest}` },
  ];
}

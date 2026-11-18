import { Office } from './models';
import { navigationLinks } from './navigation-links';

const office: Office = {
  id: 'x', name: 'Agence Test', address: '1 rue A', city: 'Lyon', phone: '', position: { lat: 45.76, lng: 4.85 },
};

describe('navigationLinks', () => {
  const links = navigationLinks(office);

  it('uses lat,lng in every link (Microsoft links use lat_lng)', () => {
    for (const l of links.filter((l) => !l.label.includes('Bing') && !l.label.includes('Windows'))) {
      expect(l.href).toContain('45.76,4.85');
    }
  });
  it('offers Microsoft links with the destination', () => {
    expect(links.find((l) => l.label.includes('Bing'))?.href).toContain('rtp=~pos.45.76_4.85_Agence%20Test');
    expect(links.find((l) => l.label.includes('Windows'))?.href.startsWith('bingmaps:')).toBe(true);
  });
  it('offers Android geo: and https links for the main apps', () => {
    expect(links.find((l) => l.label.startsWith('Android'))?.href.startsWith('geo:')).toBe(true);
    expect(links.find((l) => l.label === 'Apple Plans')?.href).toContain('maps.apple.com');
    expect(links.find((l) => l.label === 'Google Maps')?.href).toContain('destination=');
  });
  it('encodes the office name', () => {
    expect(links[0].href).toContain('Agence%20Test');
  });
});

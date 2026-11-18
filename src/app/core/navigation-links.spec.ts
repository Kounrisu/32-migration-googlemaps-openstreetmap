import { Office } from './models';
import { defaultNavApp, navigationLinks } from './navigation-links';

const office: Office = {
  id: 'x', name: 'Agence Test', address: '1 rue A', postalCode: '69000', city: 'Lyon', region: 'Auvergne-Rhône-Alpes',
  country: 'France', phone: '', position: { lat: 45.76, lng: 4.85 },
};

describe('navigationLinks', () => {
  const links = navigationLinks(office);
  const byId = (id: string) => links.find((l) => l.id === id)!;

  it('uses lat,lng in every link (Microsoft links use lat_lng)', () => {
    for (const l of links.filter((l) => l.id !== 'bing' && l.id !== 'windows')) {
      expect(l.href).toContain('45.76,4.85');
    }
  });
  it('offers Microsoft links with the destination', () => {
    expect(byId('bing').href).toContain('rtp=~pos.45.76_4.85_Agence%20Test');
    expect(byId('windows').href.startsWith('bingmaps:')).toBe(true);
  });
  it('offers Android geo: and https links for the main apps', () => {
    expect(byId('android').href.startsWith('geo:')).toBe(true);
    expect(byId('apple').href).toContain('maps.apple.com');
    expect(byId('google').href).toContain('destination=');
  });
  it('encodes the office name', () => {
    expect(byId('android').href).toContain('Agence%20Test');
  });
  it('has unique ids', () => {
    expect(new Set(links.map((l) => l.id)).size).toBe(links.length);
  });
});

describe('defaultNavApp', () => {
  it('guesses from the device', () => {
    expect(defaultNavApp('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('apple');
    expect(defaultNavApp('Mozilla/5.0 (Linux; Android 13)')).toBe('android');
    expect(defaultNavApp('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('bing');
    expect(defaultNavApp('Mozilla/5.0 (X11; Linux x86_64)')).toBe('osm');
  });
});

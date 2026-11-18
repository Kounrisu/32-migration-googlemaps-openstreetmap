import { distanceKm } from './office.service';

describe('distanceKm', () => {
  it('is ~393 km between Paris and Lyon', () => {
    const d = distanceKm({ lat: 48.8559, lng: 2.3522 }, { lat: 45.7603, lng: 4.8544 });
    expect(d).toBeGreaterThan(385);
    expect(d).toBeLessThan(400);
  });
  it('is 0 for the same point', () => {
    expect(distanceKm({ lat: 1, lng: 1 }, { lat: 1, lng: 1 })).toBe(0);
  });
});

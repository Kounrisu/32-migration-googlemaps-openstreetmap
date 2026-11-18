import { directionFr, distanceLabel, offsetMeters } from './geo';

describe('geo helpers', () => {
  it('names the compass direction in French', () => {
    expect(directionFr(0, 100)).toBe('au nord');
    expect(directionFr(100, 0)).toBe('à l’est');
    expect(directionFr(0, -100)).toBe('au sud');
    expect(directionFr(-100, 0)).toBe('à l’ouest');
    expect(directionFr(-100, -100)).toBe('au sud-ouest');
    expect(directionFr(100, 100)).toBe('au nord-est');
  });

  it('measures an offset in whole metres', () => {
    expect(offsetMeters(30, 40)).toBe(50);
  });

  it('formats distances', () => {
    expect(distanceLabel(120)).toBe('120 m');
    expect(distanceLabel(1500)).toBe('1,5 km');
    expect(distanceLabel(277300)).toBe('277 km');
  });
});

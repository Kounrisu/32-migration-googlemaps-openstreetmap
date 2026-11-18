const DIRECTIONS = [
  'au nord',
  'au nord-est',
  'à l’est',
  'au sud-est',
  'au sud',
  'au sud-ouest',
  'à l’ouest',
  'au nord-ouest',
];

/** Direction in French for an offset of `dx` metres east and `dy` metres north. */
export function directionFr(dx: number, dy: number): string {
  const angle = (Math.atan2(dx, dy) * 180) / Math.PI; // 0 = north, clockwise
  const index = Math.round(((angle + 360) % 360) / 45) % 8;
  return DIRECTIONS[index];
}

/** Straight-line distance of an offset, in whole metres. */
export function offsetMeters(dx: number, dy: number): number {
  return Math.round(Math.hypot(dx, dy));
}

/** "120 m" under a kilometre, "1,5 km" up to 10 km, then whole kilometres ("277 km"). */
export function distanceLabel(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return km < 10 ? `${km.toFixed(1).replace('.', ',')} km` : `${Math.round(km)} km`;
}

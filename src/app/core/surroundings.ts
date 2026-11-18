import { Surroundings } from './models';

/**
 * Builds DEMO data for the schematic plan: the office's own street crossing a second street,
 * with a post office, a bakery, a town hall and a transport stop around it.
 * `angleDeg` is the direction of the main street (0 = east, 90 = north). Positions are fictional;
 * in production the same shape is produced from OpenStreetMap on the server.
 */
export function around(mainStreet: string, crossStreet: string, angleDeg: number, transportName: string): Surroundings {
  const a = (angleDeg * Math.PI) / 180;
  const along: [number, number] = [Math.cos(a), Math.sin(a)];
  const across: [number, number] = [-Math.sin(a), Math.cos(a)];
  const at = (s: number, t: number): [number, number] => [
    Math.round(s * along[0] + t * across[0]),
    Math.round(s * along[1] + t * across[1]),
  ];

  const [dx1, dy1] = at(-300, 0);
  const [dx2, dy2] = at(300, 0);
  const [cx1, cy1] = at(45, -260);
  const [cx2, cy2] = at(45, 260);

  const place = (kind: 'post' | 'bakery' | 'townhall' | 'transport', name: string, s: number, t: number) => {
    const [dx, dy] = at(s, t);
    return { kind, name, dx, dy };
  };

  return {
    streets: [
      { name: mainStreet, from: [dx1, dy1], to: [dx2, dy2], main: true },
      { name: crossStreet, from: [cx1, cy1], to: [cx2, cy2] },
    ],
    landmarks: [
      place('post', 'La Poste', 130, -55),
      place('bakery', 'Boulangerie du Marché', -85, 60),
      place('townhall', 'Mairie', -190, -75),
      place('transport', transportName, 45, 95),
    ],
  };
}

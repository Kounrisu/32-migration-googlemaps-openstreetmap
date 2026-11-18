import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { directionFr, distanceLabel, offsetMeters } from '../../core/geo';
import { Landmark, LandmarkKind, Office } from '../../core/models';

const SIZE = 300;
const CENTER = SIZE / 2;
/** Pixels per metre: the plan shows about 300 m around the office. */
const K = 0.5;

const KIND: Record<LandmarkKind, { letter: string; label: string; short: string; color: string }> = {
  post: { letter: 'P', label: 'Bureau de poste', short: 'Poste', color: '#b45309' },
  bakery: { letter: 'B', label: 'Boulangerie', short: 'Boulangerie', color: '#a16207' },
  townhall: { letter: 'M', label: 'Mairie', short: 'Mairie', color: '#7e22ce' },
  transport: { letter: 'T', label: 'Transports', short: 'Transports', color: '#0f766e' },
};

const px = (dx: number) => CENTER + dx * K;
const py = (dy: number) => CENTER - dy * K;

/**
 * Light schematic plan: compass, the main streets and a few useful places around the agency
 * (post office, bakery, town hall, transport). Drawn as SVG from data, so it weighs a few
 * kilobytes, needs no map library, no WebGL and no tile request. The same facts are listed as
 * text under the drawing, because a drawing is not enough for a screen reader.
 */
@Component({
  selector: 'app-office-sketch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (office().surroundings; as s) {
      <figure>
        <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" role="img" [attr.aria-label]="'Plan schématique autour de ' + office().name + ', le nord est en haut. Les repères sont listés sous le plan.'">
          <rect width="300" height="300" fill="#f8fafc" stroke="#cbd5e1" />
          @for (st of streets(); track st.name) {
            <line [attr.x1]="st.x1" [attr.y1]="st.y1" [attr.x2]="st.x2" [attr.y2]="st.y2" stroke="#cbd5e1" [attr.stroke-width]="st.main ? 14 : 9" stroke-linecap="round" />
            <line [attr.x1]="st.x1" [attr.y1]="st.y1" [attr.x2]="st.x2" [attr.y2]="st.y2" stroke="#fff" [attr.stroke-width]="st.main ? 10 : 6" stroke-linecap="round" />
            <text [attr.x]="st.lx" [attr.y]="st.ly" class="street" [attr.text-anchor]="st.anchor">{{ st.name }}</text>
          }
          @for (l of marks(); track l.name) {
            <circle [attr.cx]="l.x" [attr.cy]="l.y" r="11" [attr.fill]="l.color" stroke="#fff" stroke-width="2" />
            <text [attr.x]="l.x" [attr.y]="l.y + 4" class="letter" text-anchor="middle">{{ l.letter }}</text>
            <text [attr.x]="l.tx" [attr.y]="l.y + 4" class="label" [attr.text-anchor]="l.anchor">{{ l.text }}</text>
          }
          <path [attr.d]="pin" fill="#dc2626" stroke="#fff" stroke-width="2" />
          <text x="150" y="176" class="label" text-anchor="middle">Agence</text>
          <g transform="translate(262 40)">
            <circle r="22" fill="#fff" stroke="#64748b" />
            <polygon points="0,-16 6,6 0,2 -6,6" fill="#dc2626" />
            <text y="19" class="letter dark" text-anchor="middle">N</text>
          </g>
          <g transform="translate(16 280)">
            <line x1="0" y1="0" x2="50" y2="0" stroke="#0f172a" stroke-width="2" />
            <text y="-5" class="label">100 m</text>
          </g>
        </svg>
        <figcaption>Plan schématique, indicatif, nord en haut.</figcaption>
      </figure>
      <h3>À proximité</h3>
      <ul>
        @for (l of listing(); track l.name) {
          <li><strong>{{ l.title }}</strong>, à {{ l.distance }} {{ l.direction }}</li>
        }
      </ul>
    } @else {
      <p>Plan non disponible pour cette agence.</p>
    }
  `,
  styles: `
    :host { display: block; }
    figure { margin: 0; }
    svg { width: 100%; max-width: 360px; height: auto; display: block; }
    figcaption { font-size: 0.85rem; color: #475569; }
    .street { font: 600 10px system-ui, sans-serif; fill: #334155; paint-order: stroke; stroke: #fff; stroke-width: 3px; }
    .label { font: 600 11px system-ui, sans-serif; fill: #0f172a; paint-order: stroke; stroke: #fff; stroke-width: 3px; }
    .letter { font: 700 12px system-ui, sans-serif; fill: #fff; }
    .letter.dark { fill: #0f172a; font-size: 11px; }
    h3 { margin: 10px 0 4px; font-size: 1rem; }
    ul { margin: 0; padding-left: 20px; }
  `,
})
export class OfficeSketch {
  readonly office = input.required<Office>();
  protected readonly size = SIZE;
  /** Teardrop pin whose tip sits on the office, at the centre of the plan. */
  protected readonly pin = 'M150 104c-9 0-16 7-16 16 0 12 16 30 16 30s16-18 16-30c0-9-7-16-16-16z';

  protected readonly streets = computed(() =>
    (this.office().surroundings?.streets ?? []).map((s) => {
      const x1 = px(s.from[0]);
      const y1 = py(s.from[1]);
      const x2 = px(s.to[0]);
      const y2 = py(s.to[1]);
      // Label near the end that is closer to the top of the drawing, kept inside the frame.
      const top = y1 < y2 ? { x: x1, y: y1 } : { x: x2, y: y2 };
      const lx = Math.min(Math.max(top.x, 8), SIZE - 8);
      const ly = Math.min(Math.max(top.y + 14, 14), SIZE - 8);
      return { name: s.name, main: !!s.main, x1, y1, x2, y2, lx, ly, anchor: lx > SIZE / 2 ? 'end' : 'start' };
    }),
  );

  protected readonly marks = computed(() =>
    (this.office().surroundings?.landmarks ?? []).map((l: Landmark) => {
      const x = px(l.dx);
      const y = py(l.dy);
      // Short text on the plan (the full names are in the list below); written outward from
      // the centre so labels do not run over the office or over each other.
      const text = l.kind === 'transport' ? l.name : KIND[l.kind].short;
      const width = text.length * 6.4;
      let right = x >= SIZE / 2;
      if (right && x + 16 + width > SIZE - 4) right = false;
      if (!right && x - 16 - width < 4) right = true;
      return { name: l.name, text, x, y, tx: right ? x + 16 : x - 16, anchor: right ? 'start' : 'end', ...KIND[l.kind] };
    }),
  );

  protected readonly listing = computed(() =>
    (this.office().surroundings?.landmarks ?? []).map((l) => ({
      name: l.name,
      title: l.name.toLowerCase().includes(KIND[l.kind].label.toLowerCase()) ? l.name : `${KIND[l.kind].label} : ${l.name}`,
      distance: distanceLabel(offsetMeters(l.dx, l.dy)),
      direction: directionFr(l.dx, l.dy),
    })),
  );
}

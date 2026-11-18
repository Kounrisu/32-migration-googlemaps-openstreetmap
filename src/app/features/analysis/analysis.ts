import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ACTORS,
  CONFIDENCE_LABEL,
  LEVEL_LABEL,
  NEEDS,
  OPTIONS,
  RECOMMENDATION,
  STAKEHOLDERS,
} from './analysis-data';

/** Page statique : qui a besoin de quoi, qui utilise quoi, quelle option couvre quel besoin. */
@Component({
  selector: 'app-analysis',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div lang="fr">
      <h1>Besoins, acteurs et options</h1>
      <p class="lead">
        Lecture d'informations publiques observées le 18/11/2026. C'est un jugement à discuter,
        pas une décision validée. Détails et sources : <code>docs/07-value-analysis.md</code>.
      </p>
      <nav aria-label="Sur cette page">
        <ul class="toc">
          <li><a href="#stakeholders">Qui a besoin de quoi</a></li>
          <li><a href="#options">Quelle option couvre quel besoin</a></li>
          <li><a href="#actors">Qui utilise quoi aujourd'hui</a></li>
          <li><a href="#reco">Recommandation</a></li>
        </ul>
      </nav>

      <section aria-labelledby="stakeholders">
        <h2 id="stakeholders">1. Des acteurs différents, des besoins différents</h2>
        <div class="scroll" role="region" aria-label="Tableau des acteurs" tabindex="0">
          <table>
            <caption class="sr">Les acteurs, leur besoin et ce que cela implique pour la carte</caption>
            <thead>
              <tr><th scope="col">Acteur</th><th scope="col">Besoin</th><th scope="col">Ce que cela implique</th></tr>
            </thead>
            <tbody>
              @for (s of stakeholders; track s.who) {
                <tr><th scope="row">{{ s.who }}</th><td>{{ s.need }}</td><td>{{ s.consequence }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="options">
        <h2 id="options">2. Quelle option couvre quel besoin</h2>
        <p>
          Légende : &#10004; oui, &#9680; en partie, &#10006; non, ? non vérifié. Rien ici n'a encore
          fait l'objet d'un audit d'accessibilité ni d'un test de charge.
        </p>
        <div class="scroll" role="region" aria-label="Matrice des options et des besoins" tabindex="0">
          <table class="matrix">
            <caption class="sr">Besoins (lignes) face aux options de carte et d'itinéraire (colonnes)</caption>
            <thead>
              <tr>
                <th scope="col">Besoin</th>
                @for (o of options; track o.key) { <th scope="col">{{ o.label }}</th> }
                <th scope="col">Remarque</th>
              </tr>
            </thead>
            <tbody>
              @for (n of needs; track n.need) {
                <tr>
                  <th scope="row">{{ n.need }}</th>
                  @for (o of options; track o.key) {
                    <td [class]="'lvl lvl-' + n.values[o.key]">
                      <span aria-hidden="true">{{ level[n.values[o.key]].symbol }}</span>
                      <span class="sr">{{ level[n.values[o.key]].text }}</span>
                    </td>
                  }
                  <td class="note">{{ n.note }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="actors">
        <h2 id="actors">3. Qui utilise quoi aujourd'hui</h2>
        <div class="scroll" role="region" aria-label="Tableau des organismes observés" tabindex="0">
          <table>
            <caption class="sr">Les organismes et la technologie cartographique observée</caption>
            <thead>
              <tr>
                <th scope="col">Organisme</th><th scope="col">Type</th>
                <th scope="col">Ce qui a été observé</th><th scope="col">Fiabilité</th>
              </tr>
            </thead>
            <tbody>
              @for (a of actors; track a.name) {
                <tr>
                  <th scope="row">{{ a.name }}</th>
                  <td>{{ a.kind }}</td>
                  <td>{{ a.observed }}</td>
                  <td>{{ confidence[a.confidence] }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p>Aucun des organismes ci-dessus n'a été vu s'appuyant sur Google Maps, dans la limite de ce qui était observable.</p>
      </section>

      <section aria-labelledby="reco" class="reco">
        <h2 id="reco">4. {{ reco.title }}</h2>
        <ul>
          @for (p of reco.points; track p) { <li>{{ p }}</li> }
        </ul>
        <h3>Risques liés aux appareils et au réseau</h3>
        <ul>
          @for (r of reco.risks; track r) { <li>{{ r }}</li> }
        </ul>
        <p><strong>{{ reco.question }}</strong></p>
        <p>{{ reco.switchIf }}</p>
        <p>
          À voir en direct : <a routerLink="/">le localisateur d'agences</a>,
          <a routerLink="/compare">Google à côté d'OSM</a>.
        </p>
      </section>
    </div>
  `,
  styles: `
    .lead { color: #475569; margin-top: 0; }
    .toc { display: flex; flex-wrap: wrap; gap: 8px 20px; padding-left: 20px; }
    section { margin-top: 28px; }
    h2 { font-size: 1.15rem; margin: 0 0 8px; }
    h3 { font-size: 1rem; margin: 12px 0 4px; }
    .scroll { overflow-x: auto; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; }
    table { border-collapse: collapse; width: 100%; font-size: 0.9rem; }
    th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 10px; text-align: left; vertical-align: top; }
    thead th { background: #f1f5f9; }
    tbody th { font-weight: 600; }
    .matrix td.lvl { text-align: center; font-size: 1.1rem; white-space: nowrap; }
    .lvl-yes { color: #15803d; }
    .lvl-partial { color: #b45309; }
    .lvl-no { color: #b91c1c; }
    .lvl-unknown { color: #475569; }
    .note { color: #475569; min-width: 260px; }
    .reco { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; }
  `,
})
export class Analysis {
  protected readonly stakeholders = STAKEHOLDERS;
  protected readonly options = OPTIONS;
  protected readonly needs = NEEDS;
  protected readonly actors = ACTORS;
  protected readonly reco = RECOMMENDATION;
  protected readonly level = LEVEL_LABEL;
  protected readonly confidence = CONFIDENCE_LABEL;
}

/**
 * Contenu de la page /analysis. Gardé sous forme de données pour pouvoir être relu et discuté
 * sans toucher au gabarit. Tout ce qui suit est la lecture de l'auteur d'informations PUBLIQUES
 * (observées le 18/11/2026) et reprend docs/07-value-analysis.md.
 */

export type Level = 'yes' | 'partial' | 'no' | 'unknown';

export const LEVEL_LABEL: Record<Level, { symbol: string; text: string }> = {
  yes: { symbol: '✔', text: 'Oui' },
  partial: { symbol: '◐', text: 'En partie' },
  no: { symbol: '✖', text: 'Non' },
  unknown: { symbol: '?', text: 'Non vérifié' },
};

export interface Stakeholder {
  who: string;
  need: string;
  consequence: string;
}

export const STAKEHOLDERS: Stakeholder[] = [
  {
    who: 'Citoyen',
    need: 'Trouver l’agence la plus proche, réserver un créneau, savoir comment s’y rendre et à quoi ressemble l’entrée.',
    consequence: 'La réservation est le cœur du service. La carte et l’itinéraire sont un confort, pas le produit.',
  },
  {
    who: 'Citoyen en situation de fragilité : réseau faible, ancien téléphone ou ordinateur',
    need: 'Que le service marche malgré une connexion lente ou instable et un appareil ancien, sans compte compliqué.',
    consequence:
      'La page doit être légère et utilisable sans carte. Pas de dépendance à WebGL ni à un navigateur récent pour l’essentiel : liste, adresse, téléphone et réservation d’abord.',
  },
  {
    who: 'Référent accessibilité (RGAA)',
    need: 'Chaque fonction utilisable au clavier et avec un lecteur d’écran, avec une alternative textuelle.',
    consequence: 'Une carte intégrée est le composant le plus difficile à rendre accessible. Toujours proposer aussi la liste.',
  },
  {
    who: 'Délégué à la protection des données (RGPD)',
    need: 'Aucune donnée personnelle ni position envoyée à un tiers sans action de l’utilisateur.',
    consequence: 'Position demandée uniquement au clic ; appels aux tuiles et au géocodeur idéalement sur notre propre domaine.',
  },
  {
    who: 'Responsable sécurité (RGS)',
    need: 'Peu de dépendances externes, un hébergement et des flux de données qualifiables.',
    consequence: 'Moins de composants et moins de tiers, c’est mieux ; CSP stricte et relais sur le même domaine.',
  },
  {
    who: 'Exploitation informatique',
    need: 'Coût prévisible, maintenance légère, un niveau de service.',
    consequence: 'Héberger soi-même un calcul d’itinéraire apporte la souveraineté et coûte de l’effort d’exploitation.',
  },
  {
    who: 'Utilisateurs mobiles (iOS, Android)',
    need: 'Transmettre la destination à leur propre application de navigation.',
    consequence: 'Les liens profonds (geo: pour Android, Plans d’Apple, Google Maps, Bing et Windows de Microsoft, Waze, OpenStreetMap) marchent partout, sans clé ni suivi.',
  },
];

export interface Option {
  key: 'google' | 'osm' | 'ign' | 'self' | 'link';
  label: string;
}

export const OPTIONS: Option[] = [
  { key: 'google', label: 'Google Maps Platform' },
  { key: 'osm', label: 'OpenStreetMap : tuiles publiques + Leaflet' },
  { key: 'ign', label: 'Géoplateforme IGN (cartes.gouv.fr)' },
  { key: 'self', label: 'OpenStreetMap : pile auto-hébergée' },
  { key: 'link', label: 'Lien vers l’application de navigation de l’utilisateur' },
];

export interface NeedRow {
  need: string;
  values: Record<Option['key'], Level>;
  note?: string;
}

export const NEEDS: NeedRow[] = [
  {
    need: 'Afficher les agences sur une carte',
    values: { google: 'yes', osm: 'yes', ign: 'yes', self: 'yes', link: 'partial' },
    note: 'L’option « lien » ouvre l’application de l’utilisateur au lieu d’intégrer une carte.',
  },
  {
    need: 'Trouver l’agence la plus proche d’une adresse',
    values: { google: 'yes', osm: 'yes', ign: 'yes', self: 'yes', link: 'yes' },
    note: 'Réalisé avec l’API adresse de la BAN et une formule de distance, indépendamment de la carte.',
  },
  {
    need: 'Itinéraire à pied',
    values: { google: 'yes', osm: 'no', ign: 'yes', self: 'yes', link: 'yes' },
    note: 'API itinéraire de l’IGN : profil piéton, limitée à 5 requêtes par seconde par IP. Auto-hébergé : Valhalla.',
  },
  {
    need: 'Itinéraire à vélo',
    values: { google: 'yes', osm: 'no', ign: 'no', self: 'yes', link: 'yes' },
    note: 'Absent de l’API de l’IGN. Auto-hébergé : Valhalla ou OpenRouteService.',
  },
  {
    need: 'Itinéraire en transports en commun',
    values: { google: 'yes', osm: 'no', ign: 'no', self: 'partial', link: 'yes' },
    note: 'Des horaires ouverts existent (transport.data.gouv.fr), mais il faut héberger et alimenter un calculateur comme OpenTripPlanner.',
  },
  {
    need: 'Itinéraire en voiture',
    values: { google: 'yes', osm: 'no', ign: 'yes', self: 'yes', link: 'yes' },
  },
  {
    need: 'Photos et informations d’accès par agence',
    values: { google: 'yes', osm: 'yes', ign: 'yes', self: 'yes', link: 'yes' },
    note: 'Nos propres données, indépendantes du fournisseur.',
  },
  {
    need: 'Aucun tiers contacté avant une action de l’utilisateur (RGPD)',
    values: { google: 'no', osm: 'partial', ign: 'partial', self: 'yes', link: 'yes' },
    note: 'Un serveur de tuiles voit l’adresse IP du visiteur. Un hébergement sur notre domaine l’évite.',
  },
  {
    need: 'Coût prévisible à grande échelle',
    values: { google: 'partial', osm: 'partial', ign: 'unknown', self: 'partial', link: 'yes' },
    note: 'Le serveur public OSM interdit un usage intensif en production. Conditions d’usage de l’IGN pour un site à fort trafic non vérifiées.',
  },
  {
    need: 'Fonctionner sur un réseau lent ou instable',
    values: { google: 'unknown', osm: 'partial', ign: 'unknown', self: 'partial', link: 'yes' },
    note: 'Poids de page et nombre de tuiles à mesurer. Chaque tuile est une requête de plus ; l’option « lien » n’en ajoute aucune.',
  },
  {
    need: 'Fonctionner sur un ancien téléphone ou ordinateur (sans WebGL)',
    values: { google: 'unknown', osm: 'yes', ign: 'partial', self: 'partial', link: 'yes' },
    note: 'Leaflet affiche des tuiles image sans WebGL. Les tuiles vectorielles de l’IGN (MapLibre) exigent WebGL ; ses tuiles WMTS en image passent avec Leaflet.',
  },
  {
    need: 'Carte utilisable au clavier et avec un lecteur d’écran (RGAA)',
    values: { google: 'unknown', osm: 'unknown', ign: 'unknown', self: 'unknown', link: 'yes' },
    note: 'Aucun audit d’accessibilité n’a été fait sur ces cartes. L’option « lien » n’a pas de carte à rendre accessible.',
  },
];

export type Confidence = 'inspected' | 'secondary' | 'press' | 'none';

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  inspected: 'Page inspectée directement',
  secondary: 'Source secondaire',
  press: 'Presse spécialisée, lue en entier',
  none: 'Rien de fiable trouvé',
};

export interface Actor {
  name: string;
  kind: string;
  observed: string;
  confidence: Confidence;
}

export const ACTORS: Actor[] = [
  {
    name: 'Caisse de Valmor',
    kind: 'Établissement public national (nom modifié)',
    observed: 'Le localisateur d’agences utilise Leaflet avec le serveur de tuiles communautaire d’OpenStreetMap.',
    confidence: 'inspected',
  },
  {
    name: 'RATP',
    kind: 'Opérateur de transport public',
    observed: 'Le calculateur d’itinéraires utilise Leaflet avec les tuiles de son propre fournisseur (onyourmap, données TomTom). Ni Google ni OSM.',
    confidence: 'inspected',
  },
  {
    name: 'SNCF Connect',
    kind: 'Application de réservation ferroviaire et de voyage',
    observed: 'MapLibre Native via Flutter pour les cartes de transport et le calcul d’itinéraire.',
    confidence: 'secondary',
  },
  {
    name: 'SNCF Connect & Tech (Tesmo Maps)',
    kind: 'Offre cartographique pour les acteurs de la mobilité',
    observed:
      'Fondée sur OpenStreetMap, lancée en juin 2026, tracé d’itinéraires et distances, à bord de plus de 300 TGV INOUI. Le client garde ses données. Prix, hébergement et qualification de sécurité inconnus.',
    confidence: 'press',
  },
  {
    name: 'Vélib’',
    kind: 'Vélos en libre-service',
    observed: 'La liste des stations est en données ouvertes ; la technologie cartographique de son application n’a pas été établie.',
    confidence: 'none',
  },
];

export const RECOMMENDATION = {
  title: 'Point de départ recommandé',
  points: [
    'Situer les agences avec une carte simple sur une source de tuiles publique de l’État ou auto-hébergée, sans Google.',
    'Déléguer l’itinéraire (à pied, à vélo, en transports, en voiture) à l’application de navigation de l’utilisateur par des liens profonds.',
    'Garder le fournisseur derrière une seule interface, pour pouvoir ajouter plus tard l’IGN, une pile auto-hébergée ou Tesmo.',
    'Concevoir « liste d’abord » : adresse, téléphone, horaires et réservation fonctionnent sans la carte, qui n’est qu’un plus.',
    'Préférer une carte en tuiles image (Leaflet) à une carte vectorielle (WebGL), et ne la charger qu’à la demande.',
  ],
  risks: [
    'L’application Angular est compilée pour ES2022 et les navigateurs récents. Sur un très ancien téléphone, elle peut ne pas démarrer : à tester sur de vrais appareils anciens.',
    'Prévoir une page de secours en HTML simple (liste des agences, adresses, téléphones) et la réservation par téléphone pour les personnes qui ne peuvent pas utiliser l’application.',
    'Fixer un budget de poids de page et le mesurer avec un réseau bridé (3G) et un processeur ralenti. Valeur à décider avec le client.',
  ],
  question:
    'Question à poser à l’établissement : l’itinéraire doit-il être calculé dans l’application, ou suffit-il de renvoyer vers l’application de navigation du citoyen ?',
  switchIf:
    'Si la réponse est « dans l’application », ajouter l’API itinéraire de l’IGN pour la marche et la voiture, puis un service hébergé pour le vélo et les transports, et envoyer une demande d’information à Tesmo.',
};

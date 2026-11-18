import { Office } from './models';

export interface OfficeFilter {
  country: string;
  region: string;
  city: string;
}

/** Empty string means "all". */
export function filterOffices<T extends Office>(offices: T[], f: OfficeFilter): T[] {
  return offices.filter(
    (o) => (!f.country || o.country === f.country) && (!f.region || o.region === f.region) && (!f.city || o.city === f.city),
  );
}

const sorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'fr'));

export const countriesOf = (offices: Office[]) => sorted(offices.map((o) => o.country));

export const regionsOf = (offices: Office[], country = '') =>
  sorted(offices.filter((o) => !country || o.country === country).map((o) => o.region));

export const citiesOf = (offices: Office[], country = '', region = '') =>
  sorted(offices.filter((o) => (!country || o.country === country) && (!region || o.region === region)).map((o) => o.city));

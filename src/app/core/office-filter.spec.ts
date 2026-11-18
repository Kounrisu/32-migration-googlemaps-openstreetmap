import { citiesOf, countriesOf, filterOffices, regionsOf } from './office-filter';
import { OfficeService } from './office.service';

const offices = new OfficeService().offices();

describe('office filter', () => {
  it('returns everything when no filter is set', () => {
    expect(filterOffices(offices, { country: '', region: '', city: '' }).length).toBe(offices.length);
  });
  it('filters by region and by city', () => {
    expect(filterOffices(offices, { country: '', region: 'Occitanie', city: '' }).map((o) => o.city)).toEqual(['Toulouse']);
    expect(filterOffices(offices, { country: '', region: '', city: 'Lille' }).length).toBe(1);
  });
  it('lists regions and cities, narrowed by the parent choice', () => {
    expect(countriesOf(offices)).toEqual(['France']);
    expect(regionsOf(offices).length).toBe(8);
    expect(citiesOf(offices, '', 'Grand Est')).toEqual(['Strasbourg']);
  });
  it('gives every office the data the page needs', () => {
    for (const o of offices) {
      expect(o.postalCode).toMatch(/^\d{5}$/);
      expect(o.surroundings?.landmarks.length).toBe(4);
      expect(o.surroundings?.streets.length).toBe(2);
    }
  });
});

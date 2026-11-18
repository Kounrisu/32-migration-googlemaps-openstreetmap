import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Trouver l’agence la plus proche', loadComponent: () => import('./features/find-office/find-office').then((m) => m.FindOffice) },
  { path: 'book/:officeId', title: 'Prendre rendez-vous', loadComponent: () => import('./features/booking/booking').then((m) => m.Booking) },
  { path: 'compare', title: 'Google Maps et OpenStreetMap', loadComponent: () => import('./features/compare/compare').then((m) => m.Compare) },
  { path: 'analysis', title: 'Besoins, acteurs et options', loadComponent: () => import('./features/analysis/analysis').then((m) => m.Analysis) },
  { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Find an office', loadComponent: () => import('./features/find-office/find-office').then((m) => m.FindOffice) },
  { path: 'book/:officeId', title: 'Book a slot', loadComponent: () => import('./features/booking/booking').then((m) => m.Booking) },
  { path: 'compare', title: 'Google Maps vs OpenStreetMap', loadComponent: () => import('./features/compare/compare').then((m) => m.Compare) },
  { path: '**', redirectTo: '' },
];

import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { ApplicationConfig, LOCALE_ID, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { ConfigService } from './core/config';
import { routes } from './app.routes';

// Dates in the booking page are written in French ("lundi 24 novembre").
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    { provide: LOCALE_ID, useValue: 'fr' },
    // Blocks bootstrap until config.json is read: the map never starts with a wrong tile URL.
    provideAppInitializer(() => inject(ConfigService).load()),
  ],
};

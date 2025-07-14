import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { InitService } from '../core/services/init-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(),
    // Display splash screen while app is initializing
    provideAppInitializer(async () => {
      const initService = inject(InitService);
      try {
        await initService.init();
      } finally {
        const splashScreen = document.getElementById('splash-screen');
        if (splashScreen) {
          splashScreen.remove();
        }
      }
    })
  ],
};

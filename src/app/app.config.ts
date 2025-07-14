import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { InitService } from '../core/services/init-service';
import { errorInterceptor } from '../core/interceptors/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([errorInterceptor])),
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

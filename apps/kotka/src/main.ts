import { enableProdMode, ErrorHandler } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from '@kotka/ui/base';
import { provideRouter, withEnabledBlockingInitialNavigation, withPreloading } from '@angular/router';
import { routes } from './app/app.routes';
import { QuicklinkStrategy } from 'ngx-quicklink';
import { provideNgxWebstorage, withLocalStorage, withNgxWebstorageConfig } from 'ngx-webstorage';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ErrorHandlerService, ConsoleLogger, HttpLogger, ILogger, Logger, HttpErrorInterceptor } from '@kotka/ui/services';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

if (environment.production) {
  enableProdMode();
}

function createLoggerLoader(httpClient: HttpClient): ILogger {
  if (environment.production) {
    return new HttpLogger(httpClient);
  }
  return new ConsoleLogger();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withPreloading(QuicklinkStrategy), withEnabledBlockingInitialNavigation()),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideNgxWebstorage(
      withNgxWebstorageConfig({ prefix: 'kotka-', separator: '' }),
      withLocalStorage()
    ),
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: Logger,
      deps: [HttpClient],
      useFactory: createLoggerLoader,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    },
    { provide: 'Window', useValue: window },
    { provide: 'oldKotkaUrl', useValue: environment.oldKotkaUrl }
  ]
}).catch(err => console.error(err));

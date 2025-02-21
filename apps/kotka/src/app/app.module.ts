import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { QuicklinkModule } from 'ngx-quicklink';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './shared/components/app/app.component';
import {
  Logger,
  ILogger,
  HttpLogger,
  ConsoleLogger,
} from '@kotka/ui/util-services';
import { environment } from '../environments/environment';
import { ErrorHandlerService } from './shared/services/error-handler/error-handler.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { NgxWebstorageModule } from 'ngx-webstorage';

export function createLoggerLoader(httpClient: HttpClient): ILogger {
  if (environment.production) {
    return new HttpLogger(httpClient);
  }
  return new ConsoleLogger();
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    QuicklinkModule,
    AppRoutingModule,
    SharedModule.forRoot(),
    NgxWebstorageModule.forRoot({ prefix: 'kotka-', separator: '' }),
  ],
  providers: [
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    {
      provide: Logger,
      deps: [HttpClient],
      useFactory: createLoggerLoader,
    },
    { provide: 'Window', useValue: window },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

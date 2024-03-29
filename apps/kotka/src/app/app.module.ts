import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { QuicklinkModule } from 'ngx-quicklink';
import { AppRoutingModule } from './app-routing.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ModalModule } from 'ngx-bootstrap/modal';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { AppComponent } from './shared/components/app/app.component';
import { NgtUniversalModule } from '@ng-toolkit/universal';
import { Logger } from './shared/services/logger/logger.service';
import { ILogger } from './shared/services/logger/logger.interface';
import { HttpLogger } from './shared/services/logger/http-logger.service';
import { ConsoleLogger } from './shared/services/logger/console-logger.service';
import { environment } from '../environments/environment';
import { ErrorHandlerService } from './shared/services/error-handler/error-handler.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

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
    NgtUniversalModule,
    AppRoutingModule,
    SharedModule.forRoot(),
    ModalModule.forRoot(),
    BsDropdownModule.forRoot()
  ],
  providers: [
    {provide: ErrorHandler, useClass: ErrorHandlerService},
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {
      provide: Logger,
      deps: [HttpClient],
      useFactory: createLoggerLoader
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

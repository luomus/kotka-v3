import { Injectable } from '@angular/core';
import { ILogger } from './logger.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpLogger implements ILogger {
  private loggerPath = '/api/laji/logger/';

  constructor(
    private httpClient: HttpClient
  ) {}

  public error(message: string, meta?: any): void {
    this._log('error', message, meta);
  }

  public info(message: string, meta?: any): void {
    this._log('info', message, meta);
  }

  public warn(message: string, meta?: any): void {
    this._log('warn', message, meta);
  }

  public log(message: string, meta?: any): void {
    // log level items are not send forward
  }

  private _log(type: 'error'|'warn'|'info', message: string, meta?: any): void {
    const path = this.loggerPath + type;
    this.httpClient.post(path, {message, meta}).subscribe();
  }
}

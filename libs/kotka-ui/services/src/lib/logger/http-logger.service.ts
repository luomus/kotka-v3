import { Injectable, inject } from '@angular/core';
import { ILogger } from './logger.interface';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpLogger implements ILogger {
  private httpClient = inject(HttpClient);

  private loggerPath = '/api/laji/logger/';

  public error(message: string, meta?: unknown): void {
    this._log('error', message, meta);
  }

  public info(message: string, meta?: unknown): void {
    this._log('info', message, meta);
  }

  public warn(message: string, meta?: unknown): void {
    this._log('warn', message, meta);
  }

  public log(): void {
    // log level items are not send forward
  }

  private _log(
    type: 'error' | 'warn' | 'info',
    message: string,
    meta?: unknown,
  ): void {
    const path = this.loggerPath + type;
    this.httpClient.post(path, { message, meta }).subscribe();
  }
}

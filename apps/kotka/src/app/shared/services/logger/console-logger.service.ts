import { ILogger } from './logger.interface';
import { Injectable } from '@angular/core';

@Injectable()
export class ConsoleLogger implements ILogger {

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
    this._log('log', message, meta);
  }

  private _log(type: 'error'|'warn'|'info'|'log', message: string, meta?: any): void {
    if (console && console[type]) {
      console[type](message, meta);
    }
  }
}

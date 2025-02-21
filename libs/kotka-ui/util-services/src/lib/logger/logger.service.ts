import { ILogger } from './logger.interface';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class Logger implements ILogger {
  abstract error(message: string, meta?: unknown): void;

  abstract warn(message: string, meta?: unknown): void;

  abstract info(message: string, meta?: unknown): void;

  abstract log(message: string, meta?: unknown): void;
}

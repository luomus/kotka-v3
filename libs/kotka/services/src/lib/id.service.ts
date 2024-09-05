import { Injectable } from '@angular/core';

export const DEFAULT_DOMAIN = 'http://tun.fi/';

@Injectable()
export class IdService {
  static getId(value: string): string;
  static getId<T>(value: T): T;
  static getId<T>(value: T | string): T | string {
    if (typeof value !== 'string' || value === '') {
      return value;
    } else if (value.indexOf(DEFAULT_DOMAIN) === 0) {
      return value.replace(DEFAULT_DOMAIN, '');
    }
    return value;
  }

  static getUri(value: string): string;
  static getUri<T>(value: T): T;
  static getUri<T>(value: T | string): T | string {
    if (typeof value !== 'string' || value === '') {
      return value;
    }
    if (value.indexOf('http') === 0) {
      return value;
    }
    return DEFAULT_DOMAIN + value;
  }
}

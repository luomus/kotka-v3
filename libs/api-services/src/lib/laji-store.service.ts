/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LajiStoreService {
  constructor (
    private readonly httpService: HttpService,
  ) {}

  private urlBase = process.env['LAJI_STORE_URL'];
  private baseConfig = { headers: { Authorization: 'Basic ' + process.env['LAJI_STORE_AUTH'] }};

  getAll(type: string, config: Record<string, unknown> = {}) {
    return this.httpService.get(`${this.urlBase}${type}`, Object.assign(config, this.baseConfig));
  }

  post(type: string, body: unknown) {
    return this.httpService.put(`${this.urlBase}${type}`, body, this.baseConfig);
  }
  get(type: string, id: string) {
    return this.httpService.get(`${this.urlBase}${type}/${id}`, this.baseConfig);
  }

  put(type: string, id: string, body: unknown) {
    return this.httpService.put(`${this.urlBase}${type}/${id}`, body, this.baseConfig);
  }

  delete(type: string, id: string) {
    return this.httpService.delete(`${this.urlBase}${type}/${id}`)
  }
}

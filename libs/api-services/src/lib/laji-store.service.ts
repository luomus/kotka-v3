/*
https://docs.nestjs.com/providers#services
*/

import { StoreGetQuery } from '@kotka/api-interfaces';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LajiStoreService {
  constructor (
    private readonly httpService: HttpService,
  ) {}

  private urlBase = process.env['LAJI_STORE_URL'];
  private baseConfig = { headers: { Authorization: 'Basic ' + process.env['LAJI_STORE_AUTH'] }};

  getAll(type: string, query: StoreGetQuery = {}) {
    return this.httpService.get(`${this.urlBase}${type}`, Object.assign({ params: query }, this.baseConfig));
  }

  post(type: string, body: unknown) {
    return this.httpService.post(`${this.urlBase}${type}`, body, this.baseConfig);
  }
  get(type: string, id: string) {
    return this.httpService.get(`${this.urlBase}${type}/${id}`, this.baseConfig);
  }

  put(type: string, id: string, body: unknown) {
    return this.httpService.put(`${this.urlBase}${type}/${id}`, body, this.baseConfig);
  }

  delete(type: string, id: string) {
    return this.httpService.delete(`${this.urlBase}${type}/${id}`, this.baseConfig);
  }
}

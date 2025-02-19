/*
https://docs.nestjs.com/providers#services
*/

import { StoreGetQuery, StoreQueryResult } from '@kotka/shared/models';
import { StoreVersion } from '@kotka/shared/models';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LajiStoreService {
  constructor (
    private readonly httpService: HttpService,
  ) {}

  private urlBase = process.env['LAJI_STORE_URL'];
  private baseConfig = { headers: { Authorization: 'Basic ' + process.env['LAJI_STORE_AUTH'] }};

  getAll<T>(type: string, query: StoreGetQuery = {}) {
    return this.httpService.get<StoreQueryResult<T>>(`${this.urlBase}${type}`, Object.assign({ params: query }, this.baseConfig));
  }

  post<T>(type: string, body: T) {
    return this.httpService.post<T>(`${this.urlBase}${type}`, body, this.baseConfig);
  }

  get<T>(type: string, id: string) {
    return this.httpService.get<T>(`${this.urlBase}${type}/${id}`, this.baseConfig);
  }

  put<T>(type: string, id: string, body: T) {
    return this.httpService.put<T>(`${this.urlBase}${type}/${id}`, body, this.baseConfig);
  }

  delete(type: string, id: string) {
    return this.httpService.delete(`${this.urlBase}${type}/${id}`, this.baseConfig);
  }

  search<T>(type: string, body: Record<string, unknown>, query: StoreGetQuery = {}) {
    return this.httpService.post<StoreQueryResult<T>>(`${this.urlBase}${type}/_search`, body, Object.assign({ params: query }, this.baseConfig));
  }

  getVersionHistory(type: string, id: string, includeDiff = false) {
    return this.httpService.get<StoreVersion[]>(`${this.urlBase}${type}/${id}/_ver`, Object.assign({ params: { include_diff: includeDiff }}, this.baseConfig));
  }

  getVersion<T>(type: string, id: string, ver: string) {
    return this.httpService.get<T>(`${this.urlBase}${type}/${id}/_ver/${ver}`, this.baseConfig);
  }
}

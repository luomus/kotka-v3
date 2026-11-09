/*
https://docs.nestjs.com/providers#services
*/

import { StoreGetQuery, StoreQueryResult } from '@kotka/shared/models';
import { StoreVersion } from '@kotka/shared/models';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { JSONSchema4 } from 'json-schema';

@Injectable()
export class LajiStoreService {
  constructor (
    private readonly httpService: HttpService,
  ) {}

  private urlBase = process.env['LAJI_STORE_URL'];
  private baseConfig = { headers: { Authorization: 'Basic ' + process.env['LAJI_STORE_AUTH'] }};

  getJsonSchema(type: string) {
    return this.httpService.get<JSONSchema4>(`${this.urlBase}json-schema/${encodeURIComponent(type)}`);
  }

  public getContext(target: string) {
    return this.httpService.get<any>(this.urlBase + 'json-ld-context/'+ encodeURIComponent(target) + '.json');
  }

  getAll<T>(type: string, query: StoreGetQuery = {}) {
    return this.httpService.get<StoreQueryResult<T>>(`${this.urlBase}${encodeURIComponent(type)}`, Object.assign({ params: query }, this.baseConfig));
  }

  post<T>(type: string, body: T) {
    return this.httpService.post<T>(`${this.urlBase}${encodeURIComponent(type)}`, body, this.baseConfig);
  }

  get<T>(type: string, id: string) {
    return this.httpService.get<T>(`${this.urlBase}${encodeURIComponent(type)}/${encodeURIComponent(id)}`, this.baseConfig);
  }

  put<T>(type: string, id: string, body: T) {
    return this.httpService.put<T>(`${this.urlBase}${encodeURIComponent(type)}/${encodeURIComponent(id)}`, body, this.baseConfig);
  }

  delete(type: string, id: string) {
    return this.httpService.delete(`${this.urlBase}${encodeURIComponent(type)}/${encodeURIComponent(id)}`, this.baseConfig);
  }

  search<T>(type: string, body: Record<string, unknown>, query: StoreGetQuery = {}) {
    return this.httpService.post<StoreQueryResult<T>>(`${this.urlBase}${encodeURIComponent(type)}/_search`, body, Object.assign({ params: query }, this.baseConfig));
  }

  getVersionHistory(type: string, id: string, includeDiff = false) {
    return this.httpService.get<StoreVersion[]>(`${this.urlBase}${encodeURIComponent(type)}/${encodeURIComponent(id)}/_ver`, Object.assign({ params: { include_diff: includeDiff }}, this.baseConfig));
  }

  getVersion<T>(type: string, id: string, ver: string) {
    return this.httpService.get<T>(`${this.urlBase}${encodeURIComponent(type)}/${encodeURIComponent(id)}/_ver/${encodeURIComponent(ver)}`, this.baseConfig);
  }

  postSequence(key: string, next?: number) {
    return this.httpService.post<{ key: string, next: number }>(`${this.urlBase}sequence`, { key, next },  this.baseConfig);
  }

  getSeqNext(seq: string, createIfMissing = false) {
    return this.httpService.get<number>(`${this.urlBase}sequence/${encodeURIComponent(seq)}/next`, Object.assign({ params: { createIfMissing: createIfMissing }}, this.baseConfig));
  }
}

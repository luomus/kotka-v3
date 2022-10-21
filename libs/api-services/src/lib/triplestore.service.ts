import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TriplestoreService {
  constructor (
    private readonly httpService: HttpService,
  ) {}

  private baseParams = { format: 'RDF/XML' };
  private headers = { Authorization: 'Basic ' + process.env['TRIPLESTORE_AUTH'] }
  private baseUrl = process.env['TRIPLESTORE_URL'];

  public get(resource: string, params = {}) {
    return this.httpService.get(this.baseUrl + resource, { headers: this.headers, params: Object.assign(this.baseParams, params) });
  }

  // public put(resource: string, body, config = {}) {
  //   return this.httpService.put(this.baseUrl + resource, body, Object.assign(config, this.baseConfig));
  // }

  public search(search: Record<string, string>, params = {}) {
    return this.httpService.get( this.baseUrl + 'search/', { headers: this.headers, params: Object.assign(this.baseParams, params, search) })
  }
}

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class LajiApiService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private baseParams= { access_token: process.env['LAJI_API_TOKEN'] };
  private baseUrl = process.env['LAJI_API_URL'];

  public get(path: string, params = {}) {
    return this.httpService.get(this.baseUrl + path, { params: Object.assign(this.baseParams, params) });
  }

  public delete(path: string, params = {}) {
    return this.httpService.get(this.baseUrl + path, { params: Object.assign(this.baseParams, params) });
  }
}

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class LajiApiService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private baseParams = { access_token: process.env['LAJI_API_TOKEN'] };
  private baseUrl = process.env['LAJI_API_URL'];

  public get<T>(path: string, params = {}): Observable<AxiosResponse<T>> {
    return this.httpService.get(this.baseUrl + path, { params: {...this.baseParams, ...params} });
  }

  public delete<T>(path: string, params = {}): Observable<AxiosResponse<T>> {
    return this.httpService.delete(this.baseUrl + path, { params: {...this.baseParams, ...params} });
  }
}

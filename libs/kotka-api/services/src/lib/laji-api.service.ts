import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { StoreObject } from '@kotka/shared/models';

@Injectable()
export class LajiApiService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private baseUrl = process.env['LAJI_API_URL'];
  private baseHeaders: { [key: string]: string | number } = {
    'API-Version': 1,
    'Authorization': process.env['LAJI_API_TOKEN']!,
    'Accept-Language': 'en'
  };

  public get<T>(path: string, params = {}, personToken?: string): Observable<AxiosResponse<T>> {
    const headers = { ...this.baseHeaders };
    if (personToken) {
      headers['Person-Token'] = personToken;
    }

    return this.httpService.get(this.baseUrl + path, { params, headers });
  }

  public post<T>(path: string, body: StoreObject, params = {}, personToken?: string): Observable<AxiosResponse<T>> {
    const headers = { ...this.baseHeaders };
    if (personToken) {
      headers['Person-Token'] = personToken;
    }

    return this.httpService.post(this.baseUrl + path, body, { params, headers });
  }

  public delete<T>(path: string, params = {}, personToken?: string): Observable<AxiosResponse<T>> {
    const headers = { ...this.baseHeaders };
    if (personToken) {
      headers['Person-Token'] = personToken;
    }

    return this.httpService.delete(this.baseUrl + path, { params, headers });
  }
}

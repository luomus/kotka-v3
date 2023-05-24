/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class OldKotkaApiService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private baseUrl = process.env['OLD_KOTKA_URL'] + 'api';

  public getRange<T>(params = {}): Observable<AxiosResponse<T>> {
    return this.httpService.get(this.baseUrl + '/range', { params });
  }}

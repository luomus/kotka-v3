/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { RangeResult } from '@kotka/shared/models';

@Injectable()
export class OldKotkaApiService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private baseUrl = process.env['OLD_KOTKA_URL'] + 'api';

  public getRange(range: string): Observable<AxiosResponse<RangeResult>> {
    return this.httpService.get(`${this.baseUrl}/range/${range}`).pipe(
      map(result => result['data'])
    );
  }
}

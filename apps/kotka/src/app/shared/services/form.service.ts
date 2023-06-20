import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { LajiForm, Area, PagedResult } from '@kotka/shared/models';
import { map } from 'rxjs/operators';
import { RangeResponse } from '@kotka/api-interfaces';
import { apiBase, lajiApiBase } from './constants';

export type EnumOption = { const: string, title: string };

@Injectable({
  providedIn: 'root'
})

export class FormService {
  private countryOptions$?: Observable<EnumOption[]>;

  constructor(
    private httpClient: HttpClient
  ) {}

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    return this.httpClient.get<LajiForm.SchemaForm>(`${lajiApiBase}/forms/${formId}`);
  }

  getAllCountryOptions(): Observable<EnumOption[]> {
    if (!this.countryOptions$) {
      const params = new HttpParams().set('type', 'country').set('pageSize', 1000).set('lang', 'en');
      this.countryOptions$ = this.httpClient.get<PagedResult<Area>>(`${lajiApiBase}/areas`, { params }).pipe(
        map(data => {
          const result: EnumOption[] = [{ const: "", title: "" }];
          data.results.forEach(area => {
            if (area.countryCodeISOalpha2) {
              result.push({ const: area.countryCodeISOalpha2, title: area.name as string });
            }
          });
          return result;
        }),
        shareReplay(1)
      );
    }

    return this.countryOptions$;
  }

  getSpecimenRange(range: string): Observable<RangeResponse> {
    return this.httpClient.get<RangeResponse>(`${apiBase}/specimen/range/${range}`);
  }
}

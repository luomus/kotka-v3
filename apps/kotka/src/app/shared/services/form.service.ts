import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { LajiForm, Area, PagedResult } from '@kotka/shared/models';
import { map } from 'rxjs/operators';

export type EnumOption = { const: string, title: string };

const path = '/api/laji/';

@Injectable({
  providedIn: 'root'
})

export class FormService {
  private countryOptions$?: Observable<EnumOption[]>;

  constructor(
    private httpClient: HttpClient
  ) {}

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    return this.httpClient.get<LajiForm.SchemaForm>(`${path}forms/${formId}`);
  }

  getAllCountryOptions(): Observable<EnumOption[]> {
    if (!this.countryOptions$) {
      const params = new HttpParams().set('type', 'country').set('pageSize', 1000).set('lang', 'en');
      this.countryOptions$ = this.httpClient.get<PagedResult<Area>>(`${path}areas`, { params }).pipe(
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
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, shareReplay } from 'rxjs';
import { LajiForm, Area, PagedResult, Organization } from '@kotka/shared/models';
import { map } from 'rxjs/operators';
import { RangeResponse } from '@kotka/api-interfaces';
import { apiBase, lajiApiBase } from './constants';
import { UserService } from './user.service';

export type EnumOption = { const: string, title: string };

@Injectable({
  providedIn: 'root'
})

export class FormService {
  private formById$: Record<string, Observable<LajiForm.SchemaForm>> = {};
  private countryOptions$?: Observable<EnumOption[]>;

  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    if (!this.formById$[formId]) {
      this.formById$[formId] = this.httpClient.get<LajiForm.SchemaForm>(`${lajiApiBase}/forms/${formId}`).pipe(
        shareReplay(1)
      );
    }
    return this.formById$[formId];
  }

  getFormInJsonFormat(formId: string): Observable<LajiForm.JsonForm> {
    const params = new HttpParams().set('format', 'json');
    return this.httpClient.get<LajiForm.JsonForm>(`${lajiApiBase}/forms/${formId}`, { params });
  }

  getFormWithUserContext(formId: string): Observable<LajiForm.SchemaForm> {
    return combineLatest([this.getForm(formId), this.userService.user$]).pipe(
      map(([form, user]) => ({
        ...form,
        uiSchemaContext: {
          userName: this.userService.formatUserName(user?.fullName),
          userEmail: user?.emailAddress,
          ...form.uiSchemaContext
        }
      }))
    );
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

  getOrganization(id: string): Observable<Organization> {
    return this.httpClient.get<Organization>(`${lajiApiBase}/organization/by-id/${id}`);
  }
}

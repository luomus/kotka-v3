import { Injectable } from '@angular/core';
import { combineLatest, Observable, shareReplay } from 'rxjs';
import { LajiForm } from '@kotka/shared/models';
import { map } from 'rxjs/operators';
import { UserService } from './user.service';
import { ApiClient } from './api-services/api-client';

export type EnumOption = { const: string, title: string };

@Injectable({
  providedIn: 'root'
})

export class FormService {
  private formById$: Record<string, Observable<LajiForm.SchemaForm>> = {};
  private countryOptions$?: Observable<EnumOption[]>;

  constructor(
    private apiClient: ApiClient,
    private userService: UserService
  ) {}

  getForm(formId: string): Observable<LajiForm.SchemaForm> {
    if (!this.formById$[formId]) {
      this.formById$[formId] = this.apiClient.getForm(formId).pipe(
        shareReplay(1)
      );
    }
    return this.formById$[formId];
  }

  getFormInJsonFormat(formId: string): Observable<LajiForm.JsonForm> {
    return this.apiClient.getFormInJsonFormat(formId);
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
      this.countryOptions$ = this.apiClient.getCountryList().pipe(
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

  getFieldData(formId: string): Observable<Record<string, any>> {
    return this.getFormInJsonFormat(formId).pipe(map(form => {
      const result: Record<string, any> = {};

      const addFieldsToResult = (fields: any[], path = '') => {
        fields.forEach(field => {
          const fieldPath = path + field.name;
          result[fieldPath] = field;
          if (field.fields) {
            addFieldsToResult(field.fields, fieldPath + '.');
          }
        });
      }

      addFieldsToResult(form.fields);

      return result;
    }));
  }
}

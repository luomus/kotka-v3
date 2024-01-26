import { Injectable } from '@angular/core';
import { ApiClient } from '@kotka/services';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { LajiForm, LajiOrganization } from '@kotka/shared/models';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { globals } from '../../../environments/globals';
import { FormService } from '@kotka/services';

export interface TransactionSheetContext {
  data: SpecimenTransaction,
  ownerOrganization?: LajiOrganization,
  correspondingOrganization?: LajiOrganization,
  fieldData: Record<string, LajiForm.Field>
}

export interface TransactionShelfSlipContext {
  data: SpecimenTransaction
}

@Injectable({
  providedIn: 'root'
})
export class TransactionPdfSheetsContextService {
  constructor(
    private apiClient: ApiClient,
    private formService: FormService
  ) {}

  getSheetContext(data: SpecimenTransaction): Observable<TransactionSheetContext> {
    type ForkJoinReturnType = [LajiOrganization|undefined, LajiOrganization|undefined, Record<string, any>];

    return forkJoin([
      this.getOrganization(data.owner),
      this.getOrganization(data.correspondentOrganization),
      this.formService.getFieldData(globals.transactionFormId)
    ]).pipe(
      map(([ownerOrganization, correspondingOrganization, fieldData]: ForkJoinReturnType) => ({
        data,
        ownerOrganization,
        correspondingOrganization,
        fieldData
    })));
  }

  getShelfSlipContext(data: SpecimenTransaction): Observable<TransactionShelfSlipContext> {
    return of({ data });
  }

  private getOrganization(organizationId?: string): Observable<LajiOrganization|undefined> {
    return organizationId ? this.apiClient.getOrganization(organizationId) : of(undefined);
  }
}

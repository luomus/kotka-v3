import { Injectable } from '@angular/core';
import { ApiClient } from '../../shared/services/api-services/api-client';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { LajiOrganization } from '@kotka/shared/models';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { globals } from '../../../environments/globals';
import { FormService } from '../../shared/services/form.service';

export interface DispatchSheetContext {
  data: SpecimenTransaction,
  ownerOrganization?: LajiOrganization,
  correspondingOrganization?: LajiOrganization,
  fieldData: Record<string, any>
}

@Injectable({
  providedIn: 'root'
})
export class TransactionPdfSheetsContextService {
  constructor(
    private apiClient: ApiClient,
    private formService: FormService
  ) {}

  getDispatchSheetContext(data: SpecimenTransaction): Observable<DispatchSheetContext> {
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

  private getOrganization(organizationId?: string): Observable<LajiOrganization|undefined> {
    return organizationId ? this.apiClient.getOrganization(organizationId) : of(undefined);
  }
}

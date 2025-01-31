import { Injectable } from '@angular/core';
import { ApiClient, FormService } from '@kotka/services';
import { Organization, SpecimenTransaction } from '@luomus/laji-schema';
import { KotkaDocumentObjectType, LajiForm } from '@kotka/shared/models';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { globals } from '../../../../environments/globals';

export interface TransactionSheetContext {
  data: SpecimenTransaction;
  ownerOrganization?: Organization;
  correspondingOrganization?: Organization;
  fieldData: Record<string, LajiForm.Field>;
}

export interface TransactionInsectShelfSlipContext {
  data: SpecimenTransaction
}

export interface TransactionBotanyShelfSlipContext {
  data: SpecimenTransaction,
  correspondingOrganization?: Organization
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
    type ForkJoinReturnType = [Organization|undefined, Organization|undefined, Record<string, LajiForm.Field>];

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

  getInsectShelfSlipContext(data: SpecimenTransaction): Observable<TransactionInsectShelfSlipContext> {
    return of({ data });
  }

  getBotanyShelfSlipContext(data: SpecimenTransaction): Observable<TransactionBotanyShelfSlipContext> {
    return this.getOrganization(data.correspondentOrganization).pipe(
      map(correspondingOrganization => ({
        data,
        correspondingOrganization
      }))
    );
  }

  private getOrganization(organizationId?: string): Observable<Organization|undefined> {
    return organizationId ? this.apiClient.getDocumentById(KotkaDocumentObjectType.organization, organizationId) : of(undefined);
  }
}

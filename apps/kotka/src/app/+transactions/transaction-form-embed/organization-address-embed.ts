import { Component } from '@angular/core';
import { catchError, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ApiClient } from '@kotka/services';
import { Organization } from '@luomus/laji-schema';
import { KotkaDocumentObjectType } from '@kotka/shared/models';

@Component({
  selector: 'kotka-organization-address-embed',
  template: `
    <div class="form-group">
      <ng-container *ngIf="data$ | async as data">
        <label><strong>Organization address:</strong></label>
        <div *ngIf="data.streetAddress">{{ data.streetAddress }}</div>
        <div *ngIf="data.postalCode">{{ data.postalCode }}</div>
        <div *ngIf="data.locality">{{ data.locality }}</div>
        <div *ngIf="data.region">{{ data.region }}</div>
        <div *ngIf="data.country">{{ data.country | uppercase }}</div>
      </ng-container>
    </div>
  `
})
export class OrganizationAddressEmbedComponent {
  set organization(organization: string|null|undefined) {
    this.organizationSubject.next(organization);
  }

  data$: Observable<Organization|undefined>;

  private organizationSubject = new ReplaySubject<string|null|undefined>(1);
  private organization$ = this.organizationSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private apiClient: ApiClient
  ) {
    this.data$ = this.organization$.pipe(
      switchMap(organizationId => this.getOrganization(organizationId))
    );
  }

  private getOrganization(organizationId?: string|null): Observable<Organization|undefined> {
    if (!organizationId) {
      return of(undefined);
    }

    return this.apiClient.getDocumentById(
      KotkaDocumentObjectType.organization, organizationId
    ).pipe(
      catchError((e) => {
        if (e?.status === 404) {
          return of(undefined);
        }
        throw e;
      })
    );
  }
}

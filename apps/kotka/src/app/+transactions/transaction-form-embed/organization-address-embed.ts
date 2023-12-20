import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ApiClient } from '@kotka/services';
import { LajiOrganization } from '@kotka/shared/models';

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
  };

  data$: Observable<LajiOrganization|undefined>;

  private organizationSubject = new ReplaySubject<string|null|undefined>(1);
  private organization$ = this.organizationSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private apiClient: ApiClient,
    private cdr: ChangeDetectorRef
  ) {
    this.data$ = this.organization$.pipe(
      switchMap(organizationId => this.getOrganization(organizationId))
    );
  }

  private getOrganization(organizationId?: string|null): Observable<LajiOrganization|undefined> {
    if (!organizationId) {
      return of(undefined);
    }
    return this.apiClient.getOrganization(organizationId);
  }
}

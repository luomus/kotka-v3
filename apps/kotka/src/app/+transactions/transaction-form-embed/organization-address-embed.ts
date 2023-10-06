import {
  Component,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { LajiFormEmbedComponent } from '@kotka/ui/laji-form';
import { ApiClient } from '../../shared/services/api-services/api-client';
import { LajiOrganization } from '@kotka/shared/models';

@Component({
  selector: 'kotka-organization-address-embed',
  template: `
    <ng-template #template let-data="data">
      <div class="form-group">
        <ng-container *ngIf="data">
          <label><strong>Organization address:</strong></label>
          <div *ngIf="data.streetAddress">{{ data.streetAddress }}</div>
          <div *ngIf="data.postalCode">{{ data.postalCode }}</div>
          <div *ngIf="data.locality">{{ data.locality }}</div>
          <div *ngIf="data.region">{{ data.region }}</div>
          <div *ngIf="data.country">{{ data.country | uppercase }}</div>
        </ng-container>
      </div>
    </ng-template>
  `
})
export class OrganizationAddressEmbedComponent implements LajiFormEmbedComponent {
  set organization(organization: string|null|undefined) {
    this.organizationSubject.next(organization);
  };

  templateContext$: Observable<any>;

  @ViewChild('template', { static: true }) template!: TemplateRef<any>;

  private organizationSubject = new ReplaySubject<string|null|undefined>(1);
  private organization$ = this.organizationSubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private apiClient: ApiClient
  ) {
    this.templateContext$ = this.organization$.pipe(
      switchMap(organizationId => this.getOrganization(organizationId)),
      map(organization => ({ data: organization }))
    );
  }

  private getOrganization(organizationId?: string|null): Observable<LajiOrganization|undefined> {
    if (!organizationId) {
      return of(undefined);
    }
    return this.apiClient.getOrganization(organizationId);
  }
}

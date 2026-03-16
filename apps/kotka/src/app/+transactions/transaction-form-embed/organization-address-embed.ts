import { Component, inject } from '@angular/core';
import { catchError, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ApiClient } from '@kotka/ui/core';
import { Organization } from '@luomus/laji-schema';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kotka-organization-address-embed',
  template: `
    <div class="form-group">
      @if (data$ | async; as data) {
        <label><strong>Organization address:</strong></label>
        @if (data.streetAddress) {
          <div>{{ data.streetAddress }}</div>
        }
        @if (data.postalCode) {
          <div>{{ data.postalCode }}</div>
        }
        @if (data.locality) {
          <div>{{ data.locality }}</div>
        }
        @if (data.region) {
          <div>{{ data.region }}</div>
        }
        @if (data.country) {
          <div>{{ data.country | uppercase }}</div>
        }
      }
    </div>
    `,
  imports: [CommonModule],
})
export class OrganizationAddressEmbedComponent {
  set organization(organization: string | null | undefined) {
    this.organizationSubject.next(organization);
  }

  data$: Observable<Organization | undefined>;

  private organizationSubject = new ReplaySubject<string | null | undefined>(1);
  private organization$ = this.organizationSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  private apiClient = inject(ApiClient);

  constructor() {
    this.data$ = this.organization$.pipe(
      switchMap((organizationId) => this.getOrganization(organizationId)),
    );
  }

  private getOrganization(
    organizationId?: string | null,
  ): Observable<Organization | undefined> {
    if (!organizationId) {
      return of(undefined);
    }

    return this.apiClient
      .getDocumentById(KotkaDocumentObjectType.organization, organizationId)
      .pipe(
        catchError((e) => {
          if (e?.status === 404) {
            return of(undefined);
          }
          throw e;
        }),
      );
  }
}

import { Component } from '@angular/core';
import { Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { AbschService, LinkData } from '@kotka/ui/services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kotka-permits-info-embed',
  template: `
    <div
      class="col-lg-6 col-md-5 col-sm-4 d-none d-sm-block ps-4 pe-4"
      style="padding-top: 20px"
      data-cy="permits-info"
    >
      In this section it is possible to fill in the information about permits,
      agreements and other such documentation related to the specimens in the
      transaction (for example Nagoya protocol). More information about the
      Nagoya protocol:
      <a href="https://absch.cbd.int/" target="_blank">absch.cbd.int</a> and
      <a
        target="_blank"
        href="https://www.ymparisto.fi/en/permits-and-obligations/import-notification-genetic-resources"
        >ymparisto.fi/en/permits-and-obligations/import-notification-genetic-resources</a
      >.
      <div *ngIf="country$ | async as country" class="mt-2">
        ABSCH links
        <ul>
          <li>
            <a
              target="_blank"
              href="https://absch.cbd.int/countries/{{ country }}"
              >Country profile page</a
            >
          </li>
          <li *ngFor="let countryLink of countryLinks$ | async">
            <a target="_blank" href="{{ countryLink.url }}">{{
              countryLink.text
            }}</a>
          </li>
        </ul>
      </div>
    </div>
  `,
  imports: [CommonModule],
})
export class PermitsInfoEmbedComponent {
  set country(country: string | null | undefined) {
    this.countrySubject.next(country);
  }

  countryLinks$: Observable<LinkData[]>;

  private countrySubject = new ReplaySubject<string | null | undefined>(1);
  country$ = this.countrySubject.asObservable().pipe(distinctUntilChanged());

  constructor(private abschService: AbschService) {
    this.countryLinks$ = this.country$.pipe(
      switchMap((country) => {
        if (country) {
          return this.abschService.getCountryLinks(country);
        } else {
          return of([]);
        }
      }),
    );
  }
}

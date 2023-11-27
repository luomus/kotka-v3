import {
  Component,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { concat, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AbschService } from '../../shared/services/api-services/absch.service';
import { LajiFormEmbedComponent } from '../../shared/services/laji-form/laji-form-embed-component.interface';

@Component({
  selector: 'kotka-permits-info-embed',
  template: `
    <ng-template #template let-country="country" let-countryLinks="countryLinks">
      <div class="col-lg-6 col-md-5 col-sm-4 d-none d-sm-block ps-4 pe-4" style="padding-top: 20px" data-cy="permits-info">
        In this section it is possible to fill in the information about permits, agreements and other such documentation
        related to the specimens in the transaction (for example Nagoya protocol).  More information about the Nagoya protocol:
        <a href="https://absch.cbd.int/" target="_blank">absch.cbd.int</a> and
        <a target="_blank" href="https://www.biodiversity.fi/geneticresources/home">biodiversity.fi/geneticresources/home</a>.
        <div *ngIf="country" class="mt-2">
          ABSCH links
          <ul>
            <li><a target="_blank" href="https://absch.cbd.int/countries/{{ country }}">Country profile page</a></li>
            <li *ngFor="let countryLink of countryLinks">
              <a target="_blank" href="{{ countryLink.url }}">{{ countryLink.text }}</a>
            </li>
          </ul>
        </div>
      </div>
    </ng-template>
  `
})
export class PermitsInfoEmbedComponent implements LajiFormEmbedComponent {
  set country(country: string|null|undefined) {
    this.countrySubject.next(country);
  };

  templateContext$: Observable<any>;

  @ViewChild('template', { static: true }) template!: TemplateRef<any>;

  private countrySubject = new ReplaySubject<string|null|undefined>(1);
  private country$ = this.countrySubject.asObservable().pipe(distinctUntilChanged());

  constructor(
    private abschService: AbschService
  ) {
    this.templateContext$ = this.country$.pipe(
      switchMap(country => {
        if (country) {
          return concat(
            of({ country, countryLinks: [] }), // show the template without the links while the links are loading
            this.abschService.getCountryLinks(country).pipe(
              map(countryLinks => ({ country, countryLinks }))
            )
          );
        } else {
          return of({ country: undefined, countryLinks: [] });
        }
      })
    );
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { DataType } from '../../shared/services/data.service';
import { LajiForm, Person, SpecimenTransaction } from '@kotka/shared/models';
import { Observable, of, shareReplay, Subscription, switchMap } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FormService } from '../../shared/services/form.service';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';

interface CbdResult {
  grouped?: {
    governmentSchemaIdentifier_s?: {
      groups?: {
        doclist?: {
          docs?: {
            rec_title?: string;
            url_ss?: string[];
          }[]
        }
      }[]
    }
  }
}

interface LinkData {
  url: string;
  text: string;
}

@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent implements OnInit, OnDestroy {
  dataType = DataType.transaction;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent;
  @ViewChild('permitsInfo', { static: true }) permitsInfoTpl!: TemplateRef<any>;

  private permitsInfoSub?: Subscription;

  private cbdUrl = 'https://api.cbd.int/api/v2013/index/select?fl=id,+identifier_s,+uniqueIdentifier_s,+url_ss,+government_s,rec_countryName:government_EN_t,+rec_title:title_EN_t,+rec_summary:description_t,rec_type:type_EN_t,+entryIntoForce_dt,adoption_dt,retired_dt,limitedApplication_dt&group=true&group.field=governmentSchemaIdentifier_s&group.limit=10&group.ngroups=true&q=(realm_ss:abs)+AND+NOT+version_s:*+AND+schema_s:(authority+absProcedure+absNationalReport)+AND+government_s:%country%&rows=500&start=0&wt=json';
  private maxCountryLinks = 3;
  private countryLinksCache: Record<string, Observable<LinkData[]>> = {};
  private prevCountry?: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private formService: FormService,
    private renderer: Renderer2,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    this.permitsInfoSub = this.getPermitsInfoSub();
  }

  ngOnDestroy() {
    this.permitsInfoSub?.unsubscribe();
  }

  augmentForm(form: LajiForm.SchemaForm): Observable<LajiForm.SchemaForm> {
    return this.formService.getAllCountryOptions().pipe(switchMap(countries => {
      form.schema.properties.geneticResourceAcquisitionCountry.oneOf = countries;
      return of(form);
    }));
  }

  getInitialFormData(user: Person): Partial<SpecimenTransaction> {
    const formData: Partial<SpecimenTransaction> = {};
    if (user?.organisation && user.organisation.length === 1) {
      formData.owner = user.organisation[0];
    }
    return formData;
  }

  private getPermitsInfoSub(): Subscription {
    return this.formView.formDataChange.pipe(
      map((data: Partial<SpecimenTransaction>) => data.geneticResourceAcquisitionCountry),
      tap((country) => {
        if (country && !this.countryLinksCache[country]) {
          this.updatePermitsInfo(); // show the info without the country while the country links are loading
        }
      }),
      switchMap(country => this.getCountryLinks(country).pipe(
        map(countryLinks => ({ country, countryLinks }))
      ))
    ).subscribe(({ country, countryLinks }) => {
      this.updatePermitsInfo(country, countryLinks);
    });
  }

  private getCountryLinks(country?: string): Observable<LinkData[]> {
    if (!country) {
      return of([]);
    }

    if (!this.countryLinksCache[country]) {
      const url = this.cbdUrl.replace('%country%', country.toLocaleLowerCase());
      this.countryLinksCache[country] = this.httpClient.get<CbdResult>(url).pipe(
        map(result => {
          const countryLinks: LinkData[] = [];

          (result.grouped?.governmentSchemaIdentifier_s?.groups || []).forEach(data => {
            (data.doclist?.docs || []).forEach(doc => {
              if (countryLinks.length >= this.maxCountryLinks) {
                return;
              }
              if (doc.rec_title && doc.url_ss?.[0]) {
                countryLinks.push({url: doc.url_ss[0], text: doc.rec_title});
              }
            });
          });

          return countryLinks;
        }),
        shareReplay(1)
      );
    }

    return this.countryLinksCache[country];
  }

  private updatePermitsInfo(country?: string, countryLinks?: LinkData[]) {
    const { oldElem, parentElem } = this.getPermitsInfoElems();

    if (!parentElem || (oldElem && this.prevCountry === country)) {
      return;
    }
    this.prevCountry = country;

    const view = this.permitsInfoTpl.createEmbeddedView({ country, countryLinks });
    view.detectChanges();
    const newElem = view.rootNodes[0].cloneNode(true);
    view.destroy();

    if (oldElem) {
      this.renderer.removeChild(parentElem, oldElem);
    }
    this.renderer.appendChild(parentElem, newElem);
  }

  private getPermitsInfoElems() {
    const oldElem: HTMLElement|null|undefined = this.document.getElementById("permitsInfo");
    const parentElem: HTMLElement|null|undefined = oldElem?.parentElement ||
      this.document.getElementsByClassName("nagoya-fields")?.[0]?.parentElement?.parentElement;

    return { oldElem, parentElem };
  }
}

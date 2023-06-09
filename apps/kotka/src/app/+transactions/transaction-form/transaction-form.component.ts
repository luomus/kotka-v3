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
import { LajiForm, Person, Transaction } from '@kotka/shared/models';
import { Observable, of, ReplaySubject, Subscription, switchMap } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { FormService } from '../../shared/services/form.service';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

  @ViewChild('permitsInfo') permitsInfoTpl!: TemplateRef<any>;

  private geneticResourceAcquisitionCountrySubject = new ReplaySubject<string|undefined>();
  private geneticResourceAcquisitionCountry$: Observable<string|undefined>;

  private permitsInfoSub?: Subscription;

  private cbdUrl = 'https://api.cbd.int/api/v2013/index/select?fl=id,+identifier_s,+uniqueIdentifier_s,+url_ss,+government_s,rec_countryName:government_EN_t,+rec_title:title_EN_t,+rec_summary:description_t,rec_type:type_EN_t,+entryIntoForce_dt,adoption_dt,retired_dt,limitedApplication_dt&group=true&group.field=governmentSchemaIdentifier_s&group.limit=10&group.ngroups=true&q=(realm_ss:abs)+AND+NOT+version_s:*+AND+schema_s:(authority+absProcedure+absNationalReport)+AND+government_s:%country%&rows=500&start=0&wt=json';
  private maxCountryLinks = 3;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private formService: FormService,
    private renderer: Renderer2,
    private httpClient: HttpClient
  ) {
    this.geneticResourceAcquisitionCountry$ = this.geneticResourceAcquisitionCountrySubject.pipe(
      distinctUntilChanged()
    );
  }

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

  getInitialFormData(user: Person): Partial<Transaction> {
    const formData: Partial<Transaction> = {};
    if (user?.organisation && user.organisation.length === 1) {
      formData.owner = user.organisation[0];
    }
    return formData;
  }

  onFormDataChange(formData: Partial<Transaction>) {
    this.geneticResourceAcquisitionCountrySubject.next(formData.geneticResourceAcquisitionCountry);
  }

  private getPermitsInfoSub(): Subscription {
    return this.geneticResourceAcquisitionCountry$.pipe(
      tap(() => this.updatePermitsInfo()),
      switchMap(country => this.getCountryLinks(country).pipe(
        map(countryLinks => ({ country, countryLinks }))
      ))
    ).subscribe(({ country, countryLinks }) => {
      if (country) {
        this.updatePermitsInfo(country, countryLinks);
      }
    });
  }

  private getCountryLinks(country?: string): Observable<LinkData[]> {
    if (!country) {
      return of([]);
    }

    const url = this.cbdUrl.replace('%country%', country.toLocaleLowerCase());
    return this.httpClient.get<CbdResult>(url).pipe(map(result => {
      const countryLinks: LinkData[] = [];

      (result.grouped?.governmentSchemaIdentifier_s?.groups || []).forEach(data => {
        (data.doclist?.docs || []).forEach(doc => {
          if (countryLinks.length >= this.maxCountryLinks) {
            return;
          }
          if (doc.rec_title && doc.url_ss?.[0]) {
            countryLinks.push({ url: doc.url_ss[0], text: doc.rec_title });
          }
        });
      });

      return countryLinks;
    }));
  }

  private updatePermitsInfo(country?: string, countryLinks?: LinkData[]) {
    const oldElem: HTMLElement|null|undefined = this.document.getElementById("permitsInfo");
    const parentElem: HTMLElement|null|undefined = oldElem?.parentElement ||
      this.document.getElementsByClassName("nagoya-fields")?.[0]?.parentElement?.parentElement;

    if (!parentElem) {
      return;
    }

    const view = this.permitsInfoTpl.createEmbeddedView({ country, countryLinks });
    view.detectChanges();
    const newElem = view.rootNodes[0].cloneNode(true);
    view.destroy();

    if (oldElem) {
      this.renderer.removeChild(parentElem, oldElem);
    }
    this.renderer.appendChild(parentElem, newElem);
  }
}

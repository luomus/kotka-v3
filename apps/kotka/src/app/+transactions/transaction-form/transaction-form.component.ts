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
import {
  LajiForm,
  Person,
  SpecimenTransaction,
  SpecimenTransactionEvent
} from '@kotka/shared/models';
import { from, Observable, of, shareReplay, Subscription, switchMap } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { FormService } from '../../shared/services/form.service';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionEventFormComponent } from './transaction-event-form.component';

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

type SpecimenIdKey = keyof Pick<SpecimenTransaction, 'awayIDs'|'returnedIDs'|'missingIDs'|'damagedIDs'>;

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
  @ViewChild('specimenRangeSelect', { static: true }) specimenRangeSelectTpl!: TemplateRef<any>;

  private subscription = new Subscription();
  private formData?: Partial<SpecimenTransaction>;

  private cbdUrl = 'https://api.cbd.int/api/v2013/index/select?fl=id,+identifier_s,+uniqueIdentifier_s,+url_ss,+government_s,rec_countryName:government_EN_t,+rec_title:title_EN_t,+rec_summary:description_t,rec_type:type_EN_t,+entryIntoForce_dt,adoption_dt,retired_dt,limitedApplication_dt&group=true&group.field=governmentSchemaIdentifier_s&group.limit=10&group.ngroups=true&q=(realm_ss:abs)+AND+NOT+version_s:*+AND+schema_s:(authority+absProcedure+absNationalReport)+AND+government_s:%country%&rows=500&start=0&wt=json';
  private maxCountryLinks = 3;
  private countryLinksCache: Record<string, Observable<LinkData[]>> = {};
  private prevCountry?: string;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private formService: FormService,
    private renderer: Renderer2,
    private httpClient: HttpClient,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  private initSubscriptions() {
    this.subscription.add(
      this.formView.formDataChange.subscribe(formData => {
        this.formData = formData;
        this.addSpecimenRangeSelect();
      })
    );

    this.subscription.add(
      this.formView.formDataChange.pipe(
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
      })
    );

    this.subscription.add(
      this.formView.formDataChange.pipe(
        map(() => this.document.getElementById('root_transactionEvents-add')),
        distinctUntilChanged()
      ).subscribe((addButton) => {
        if (addButton) {
          addButton.onclick = this.addTransactionEventButtonClick.bind(this);
        }
      })
    );
  }

  private addTransactionEventButtonClick(event: MouseEvent) {
    event.stopPropagation();

    const modalRef = this.modalService.open(TransactionEventFormComponent, {
      backdrop: 'static',
      size: 'lg'
    });

    from(modalRef.result).subscribe({
      'next': result => this.addTransactionEvent(result),
      'error': () => undefined
    });
  }

  private addTransactionEvent(transactionEvent: SpecimenTransactionEvent) {
    let formData = { ...this.formData || {} };

    const transactionEvents = [...(this.formData?.transactionEvents || []), transactionEvent];
    formData = { ...formData, transactionEvents };

    // const markAs = result.markAs TODO schema changes
    // const eventIds = transactionEvent.eventDocumentIDs || [];
    const markAs = 'returned';
    const eventIds = ['a', 'b', 'c'];

    const specimenIdFields: SpecimenIdKey[] = ['awayIDs', 'returnedIDs', 'missingIDs', 'damagedIDs'];
    specimenIdFields.forEach(field => {
      formData[field] = (formData[field] || []).filter(id => !eventIds.includes(id));
    });
    const key: SpecimenIdKey = (markAs + 'IDs') as SpecimenIdKey;
    formData[key] = [...(formData[key] || []), ...eventIds];

    this.formView.setFormData(formData);
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
    const oldElem: HTMLElement|null = this.document.getElementById("permitsInfo");
    const parentElem: HTMLElement|null|undefined = oldElem?.parentElement ||
      this.document.getElementsByClassName("nagoya-fields")?.[0]?.parentElement?.parentElement;

    if (!parentElem || (oldElem && this.prevCountry === country)) {
      return;
    }
    this.prevCountry = country;

    const newElem = this.createElementFromTemplate(this.permitsInfoTpl, { country, countryLinks });
    this.appendElement(parentElem, newElem, oldElem);
  }

  private addSpecimenRangeSelect() {
    const oldElem: HTMLElement|null = this.document.getElementById("specimenRangeSelect");
    if (oldElem) {
      return;
    }

    const parentElem: HTMLElement|undefined = this.document.getElementsByClassName("specimen-id-fields")?.[0] as HTMLElement;
    if (!parentElem) {
      return;
    }

    const newElem = this.createElementFromTemplate(this.specimenRangeSelectTpl, {});
    this.appendElement(parentElem, newElem);
    this.document.getElementById("specimenRangeBtn")?.addEventListener('click', this.specimenRangeClick.bind(this));
  }

  private specimenRangeClick() {
    const range: string = (this.document.getElementById("specimenRangeInput") as HTMLInputElement)?.value || '';
    if (!range) {
      return;
    }

    this.formService.getSpecimenRange(range).subscribe(result => {
      if (result.status === 'ok') {
        const awayIDs = [...(this.formData?.awayIDs || []), ...(result.items || [])];
        const formData = { ...this.formData || {}, awayIDs };
        this.formView.setFormData(formData);
      }
    });
  }

  private createElementFromTemplate<T>(tpl: TemplateRef<T>, context: T): HTMLElement {
    const view = tpl.createEmbeddedView(context);
    view.detectChanges();
    const newElem = view.rootNodes[0].cloneNode(true);
    view.destroy();
    return newElem;
  }

  private appendElement(parentElem: HTMLElement, newElem: HTMLElement, oldElem?: HTMLElement|null) {
    if (oldElem) {
      this.renderer.removeChild(parentElem, oldElem);
    }
    this.renderer.appendChild(parentElem, newElem);
  }
}

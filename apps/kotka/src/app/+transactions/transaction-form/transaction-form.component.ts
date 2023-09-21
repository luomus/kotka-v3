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
import { DataType } from '../../shared/services/api-services/data.service';
import {
  LajiForm, Organization,
  Person,
  SpecimenTransaction,
  SpecimenTransactionEvent
} from '@kotka/shared/models';
import { from, Observable, of, Subscription, switchMap } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';
import { FormService } from '../../shared/services/api-services/form.service';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionEventFormComponent } from './transaction-event-form.component';
import { DialogService } from '../../shared/services/dialog.service';
import { AbschService, LinkData } from '../../shared/services/api-services/absch.service';

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
  @ViewChild('organizationAddress', { static: true }) organizationAddressTpl!: TemplateRef<any>;
  @ViewChild('permitsInfo', { static: true }) permitsInfoTpl!: TemplateRef<any>;
  @ViewChild('specimenRangeSelect', { static: true }) specimenRangeSelectTpl!: TemplateRef<any>;

  private subscription = new Subscription();
  private formData?: Partial<SpecimenTransaction>;

  private permitsInfoElem?: HTMLElement|null;

  private prevOrganizationId?: string;
  private prevCountry?: string;

  private eventTypeSpecimenIdFieldMap: Record<Exclude<SpecimenTransactionEvent['eventType'], undefined>, SpecimenIdKey|undefined> = {
    '': undefined,
    'HRX.eventTypeReturn': 'returnedIDs',
    'HRX.eventTypeAddition': 'awayIDs'
  };

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private formService: FormService,
    private renderer: Renderer2,
    private httpClient: HttpClient,
    private modalService: NgbModal,
    private dialogService: DialogService,
    private abschService: AbschService
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
        map((data: Partial<SpecimenTransaction>) => (
          /^MOS\.\d+/.test(data.correspondentOrganization || '') ? data.correspondentOrganization : undefined
        )),
        switchMap(organization => this.getOrganization(organization))
      ).subscribe((data) => {
        this.updateOrganizationAddress(data);
      })
    );

    this.subscription.add(
      this.formView.formDataChange.pipe(
        map((data: Partial<SpecimenTransaction>) => data.geneticResourceAcquisitionCountry),
        tap((country) => {
          if (country) {
            this.updatePermitsInfo(); // show the info without the country while the country links are loading
          }
        }),
        switchMap(country => this.abschService.getCountryLinks(country).pipe(
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
    modalRef.componentInstance.transactionType = this.formData?.type;

    from(modalRef.result).subscribe({
      'next': result => this.addTransactionEvent(result),
      'error': () => undefined
    });
  }

  private addTransactionEvent(transactionEvent: SpecimenTransactionEvent) {
    let formData = { ...this.formData || {} };
    const transactionEvents = [...(formData.transactionEvents || []), transactionEvent];
    formData = { ...formData, transactionEvents };

    const specimenIdField = this.eventTypeSpecimenIdFieldMap[transactionEvent.eventType || ''];
    const eventIds = transactionEvent.eventDocumentIDs || [];

    if (specimenIdField) {
      const specimenIdFields: SpecimenIdKey[] = ['awayIDs', 'returnedIDs', 'missingIDs'];
      specimenIdFields.forEach(field => {
        formData[field] = (formData[field] || []).filter(id => !eventIds.includes(id));
      });
      formData[specimenIdField] = [...(formData[specimenIdField] || []), ...eventIds];
    }

    this.setFormData(formData);
  }

  private getOrganization(organizationId?: string): Observable<Organization|undefined> {
    if (!organizationId) {
      return of(undefined);
    }
    return this.formService.getOrganization(organizationId);
  }

  private updateOrganizationAddress(data?: Organization) {
    const oldElem: HTMLElement|null = this.document.getElementById("organizationAddress");
    const organizationElem: HTMLElement|null|undefined = this.document.getElementsByClassName(
      "correspondent-organization")?.[0] as HTMLElement|null|undefined;

    if (!organizationElem || (oldElem && this.prevOrganizationId === data?.id)) {
      return;
    }
    this.prevOrganizationId = data?.id;

    const newElem = this.createElementFromTemplate(this.organizationAddressTpl, { data });
    this.appendElementAfter(organizationElem, newElem, oldElem);
  }

  private updatePermitsInfo(country?: string, countryLinks?: LinkData[]) {
    const oldElem: HTMLElement|null|undefined = this.permitsInfoElem;
    const parentElem: HTMLElement|null|undefined = oldElem?.parentElement ||
      this.document.getElementsByClassName("nagoya-fields")?.[0]?.parentElement?.parentElement;

    if (!parentElem || (oldElem && this.prevCountry === country)) {
      return;
    }
    this.prevCountry = country;

    const newElem = this.createElementFromTemplate(this.permitsInfoTpl, { country, countryLinks });
    this.appendElement(parentElem, newElem, oldElem);
    this.permitsInfoElem = newElem;
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
    this.appendElement(parentElem, newElem, undefined, true);
    this.document.getElementById("specimenRangeBtn")?.addEventListener('click', this.specimenRangeClick.bind(this));
  }

  private specimenRangeClick() {
    const specimenRangeInput = this.document.getElementById("specimenRangeInput") as HTMLInputElement|null;
    const range: string = specimenRangeInput?.value || '';
    if (!range) {
      return;
    }
    if (!/^([A-Z0-9]+\.)?[0-9]+-[0-9]+$/g.test(range)) {
      this.dialogService.alert('Incorrect range format');
      return;
    }

    this.formView.lajiForm?.block();
    this.formService.getSpecimenRange(range).subscribe({
      'next': result => {
        if (result.status === 'ok') {
          const awayIDs = [...(this.formData?.awayIDs || []), ...(result.items || [])];
          const formData = {...this.formData || {}, awayIDs};
          this.setFormData(formData);

          if (specimenRangeInput) {
            specimenRangeInput.value = '';
          }
        } else {
          this.dialogService.alert(result.status);
        }
        this.formView.lajiForm?.unBlock();
      },
      'error': () => {
        this.dialogService.alert('An unexpected error occurred.');
        this.formView.lajiForm?.unBlock();
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

  private appendElement(parentElem: HTMLElement, newElem: HTMLElement, oldElem?: HTMLElement|null, asFirst = false) {
    if (oldElem) {
      this.renderer.removeChild(parentElem, oldElem);
    }

    if (asFirst) {
      this.renderer.insertBefore(parentElem, newElem, parentElem.firstChild);
    } else {
      this.renderer.appendChild(parentElem, newElem);
    }
  }

  private appendElementAfter(elem: HTMLElement, newElem: HTMLElement, oldElem?: HTMLElement|null) {
    const parentElem = elem.parentElement;

    if (oldElem) {
      this.renderer.removeChild(parentElem, oldElem);
    }
    this.renderer.insertBefore(parentElem, newElem, elem.nextSibling);
  }

  private setFormData(formData: Partial<SpecimenTransaction>) {
    this.formData = formData;
    this.formView.setFormData(formData);
  }
}

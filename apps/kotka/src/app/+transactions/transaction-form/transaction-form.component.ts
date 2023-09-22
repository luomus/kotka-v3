import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef, OnDestroy,
  ViewChild
} from '@angular/core';
import { DataType } from '../../shared/services/api-services/data.service';
import {
  LajiForm,
  Person,
  SpecimenTransaction,
  SpecimenTransactionEvent
} from '@kotka/shared/models';
import { from, Observable, of, Subscription, switchMap } from 'rxjs';
import { FormService } from '../../shared/services/api-services/form.service';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionEventFormComponent } from './transaction-event-form.component';
import { DialogService } from '../../shared/services/dialog.service';
import { OrganizationAddressEmbedComponent } from '../transaction-form-embed/organization-address-embed';
import { PermitsInfoEmbedComponent } from '../transaction-form-embed/permits-info-embed';
import { SpecimenRangeSelectEmbedComponent } from '../transaction-form-embed/specimen-range-select-embed';
import {
  LajiFormComponent,
  LajiFormComponentEmbedderService,
  LajiFormEmbedService,
  LajiFormEventListenerEmbedderService
} from '@kotka/ui/laji-form';

type SpecimenIdKey = keyof Pick<SpecimenTransaction, 'awayIDs'|'returnedIDs'|'missingIDs'|'damagedIDs'>;

@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent implements OnDestroy {
  dataType = DataType.transaction;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent;

  private formData?: Partial<SpecimenTransaction>;
  private correspondentOrganization?: string;
  private geneticResourceAcquisitionCountry?: string;

  private organizationAddressRef?: ComponentRef<OrganizationAddressEmbedComponent>;
  private permitsInfoRef?: ComponentRef<PermitsInfoEmbedComponent>;
  private specimenRangeSelectRef?: ComponentRef<SpecimenRangeSelectEmbedComponent>;

  private specimenRangeButtonClickSubscription?: Subscription;

  private eventTypeSpecimenIdFieldMap: Record<Exclude<SpecimenTransactionEvent['eventType'], undefined>, SpecimenIdKey|undefined> = {
    '': undefined,
    'HRX.eventTypeReturn': 'returnedIDs',
    'HRX.eventTypeAddition': 'awayIDs'
  };

  constructor(
    private formService: FormService,
    private modalService: NgbModal,
    private dialogService: DialogService,
    private lajiFormComponentEmbedderService: LajiFormComponentEmbedderService,
    private lajiFormEventListenerEmbedderService: LajiFormEventListenerEmbedderService
  ) {}

  ngOnDestroy() {
    this.specimenRangeButtonClickSubscription?.unsubscribe();
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

  onFormReady() {
    const lajiFormEmbedService = new LajiFormEmbedService(
      this.lajiFormComponentEmbedderService,
      this.lajiFormEventListenerEmbedderService,
      this.formView.lajiForm as LajiFormComponent
    );

    this.initEmbeddedComponents(lajiFormEmbedService);
    lajiFormEmbedService.addOnClickEventListener(
      'root_transactionEvents-add',
      this.onAddTransactionEventButtonClick.bind(this)
    );
  }

  onFormDataChange(formData: Partial<SpecimenTransaction>) {
    this.formData = formData;
    this.updateEmbeddedComponents(formData);
  }

  private initEmbeddedComponents(lajiFormEmbedService: LajiFormEmbedService) {
    this.organizationAddressRef = lajiFormEmbedService.embedComponent(OrganizationAddressEmbedComponent, {
      anchorClassName: 'correspondent-organization',
      positionToAnchor: 'nextSibling'
    });
    this.organizationAddressRef.instance.organization = this.correspondentOrganization;

    this.permitsInfoRef = lajiFormEmbedService.embedComponent(PermitsInfoEmbedComponent, {
      anchorClassName: 'nagoya-fields',
      positionToAnchor: 'parentNextSibling'
    });
    this.permitsInfoRef.instance.country = this.geneticResourceAcquisitionCountry;

    this.specimenRangeSelectRef = lajiFormEmbedService.embedComponent(SpecimenRangeSelectEmbedComponent, {
      anchorClassName: 'specimen-id-fields',
      positionToAnchor: 'firstChild'
    });
    this.specimenRangeButtonClickSubscription = this.specimenRangeSelectRef.instance.specimenRangeClick.subscribe(range => {
      this.specimenRangeClick(range);
    });
  }

  private updateEmbeddedComponents(formData: Partial<SpecimenTransaction>) {
    const correspondentOrganization = this.getValidOrganizationId(formData.correspondentOrganization);
    if (this.organizationAddressRef) {
      this.organizationAddressRef.instance.organization = correspondentOrganization;
    }

    const geneticResourceAcquisitionCountry = formData.geneticResourceAcquisitionCountry;
    if (this.permitsInfoRef) {
      this.permitsInfoRef.instance.country = geneticResourceAcquisitionCountry;
    }
  }

  private onAddTransactionEventButtonClick(event: MouseEvent) {
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

  specimenRangeClick(range: string) {
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

          this.specimenRangeSelectRef?.instance.clearSpecimenRangeInput();
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

  private setFormData(formData: Partial<SpecimenTransaction>) {
    this.formData = formData;
    this.formView.setFormData(formData);
  }

  private getValidOrganizationId(organizationId?: string): string|undefined {
    return organizationId && /^MOS\.\d+/.test(organizationId) ? organizationId : undefined;
  }
}

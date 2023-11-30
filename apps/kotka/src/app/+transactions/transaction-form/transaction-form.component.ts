import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  asPartialSpecimenTransaction,
  KotkaDocumentObjectType,
  LajiForm,
  SpecimenTransaction,
  SpecimenTransactionEvent,
  isSpecimenTransaction,
  asSpecimenTransaction
} from '@kotka/shared/models';
import { from, Observable, of, Subscription, switchMap } from 'rxjs';
import { FormService } from '../../shared/services/form.service';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionEventFormComponent } from './transaction-event-form.component';
import { DialogService } from '../../shared/services/dialog.service';
import {
  LajiFormComponent,
} from '@kotka/ui/laji-form';
import { ComponentCanDeactivate } from '../../shared/services/guards/component-can-deactivate.guard';
import { ApiClient } from '../../shared/services/api-services/api-client';
import { TransactionFormEmbedService } from '../transaction-form-embed/transaction-form-embed.service';
import { globals } from '../../../environments/globals';

type SpecimenIdKey = keyof Pick<SpecimenTransaction, 'awayIDs'|'returnedIDs'|'missingIDs'|'damagedIDs'>;

@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent implements OnDestroy, ComponentCanDeactivate {
  formId = globals.transactionFormId;
  dataType = KotkaDocumentObjectType.transaction;
  augmentFormFunc = this.augmentForm.bind(this);

  formData?: Partial<SpecimenTransaction>;

  isSpecimenTransaction = isSpecimenTransaction;
  asSpecimenTransaction = asSpecimenTransaction;
  asPartialSpecimenTransaction = asPartialSpecimenTransaction;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent;

  private specimenRangeButtonClickSubscription?: Subscription;

  private eventTypeSpecimenIdFieldMap: Record<Exclude<SpecimenTransactionEvent['eventType'], undefined>, SpecimenIdKey|undefined> = {
    '': undefined,
    'HRX.eventTypeReturn': 'returnedIDs',
    'HRX.eventTypeAddition': 'awayIDs'
  };

  private disabled = false;

  constructor(
    private apiClient: ApiClient,
    private formService: FormService,
    private modalService: NgbModal,
    private dialogService: DialogService,
    private transactionFormEmbedService: TransactionFormEmbedService
  ) {}

  ngOnDestroy() {
    this.specimenRangeButtonClickSubscription?.unsubscribe();
  }

  canDeactivate(): Observable<boolean> {
    return this.formView.canDeactivate();
  }

  onFormInit(lajiForm: LajiFormComponent) {
    this.transactionFormEmbedService.initEmbeddedComponents(
      lajiForm, this.formData || {}, this.onAddTransactionEventButtonClick.bind(this)
    );
    this.specimenRangeButtonClickSubscription = this.transactionFormEmbedService.specimenRangeClick$?.subscribe(range => (
      this.specimenRangeClick(range)
    ));

    if (this.disabled) {
      this.setDisabled(this.disabled);
    }
  }

  onFormDataChange(formData: Partial<SpecimenTransaction>) {
    this.formData = formData;
    this.transactionFormEmbedService.updateEmbeddedComponents(formData);
  }

  setDisabled(disabled: boolean) {
    this.disabled = disabled;
    this.transactionFormEmbedService.setEmbeddedComponentsDisabled(disabled);
  }

  private augmentForm(form: LajiForm.SchemaForm): Observable<LajiForm.SchemaForm> {
    return this.formService.getAllCountryOptions().pipe(switchMap(countries => {
      form.schema.properties.geneticResourceAcquisitionCountry.oneOf = countries;
      return of(form);
    }));
  }

  private onAddTransactionEventButtonClick(event: MouseEvent) {
    event.stopPropagation();

    const modalRef = this.modalService.open(TransactionEventFormComponent, {
      backdrop: 'static',
      size: 'lg',
      modalDialogClass: 'transaction-event-modal'
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

    this.formView.setFormData(formData);
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
    this.apiClient.getSpecimenRange(range).subscribe({
      'next': result => {
        if (result.status === 'ok') {
          const awayIDs = [...(this.formData?.awayIDs || []), ...(result.items || [])];
          const formData = {...this.formData || {}, awayIDs};
          this.formView.setFormData(formData);

          this.transactionFormEmbedService.clearSpecimenRangeSelect();
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
}

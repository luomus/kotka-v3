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
import { FormService, DialogService } from '@kotka/services';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TransactionEventFormComponent } from './transaction-event-form.component';
import {
  LajiFormComponent,
} from '@kotka/ui/laji-form';
import { ApiClient } from '@kotka/services';
import { TransactionFormEmbedService } from '../transaction-form-embed/transaction-form-embed.service';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '../../shared-modules/form-view/form-view/form-view-container';

type SpecimenIdKey = keyof Pick<SpecimenTransaction, 'awayIDs'|'returnedIDs'|'missingIDs'|'damagedIDs'>;

@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent extends FormViewContainerComponent implements OnDestroy {
  formId = globals.transactionFormId;
  dataType = KotkaDocumentObjectType.transaction;
  augmentFormFunc = this.augmentForm.bind(this);

  formData?: Partial<SpecimenTransaction>;

  isSpecimenTransaction = isSpecimenTransaction;
  asSpecimenTransaction = asSpecimenTransaction;
  asPartialSpecimenTransaction = asPartialSpecimenTransaction;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent;

  private specimenRangeButtonClickSubscription?: Subscription;

  private eventTypeSpecimenIdFieldMap: Record<Exclude<SpecimenTransactionEvent['eventType'], undefined> | '', SpecimenIdKey|undefined> = {
    '': undefined,
    'HRX.eventTypeReturn': 'returnedIDs',
    'HRX.eventTypeAddition': 'awayIDs'
  };

  private disabled = false;

  constructor(
    private apiClient: ApiClient,
    private formService: FormService,
    private modalService: NgbModal,
    dialogService: DialogService,
    private transactionFormEmbedService: TransactionFormEmbedService
  ) {
    super(dialogService);
  }

  ngOnDestroy() {
    this.specimenRangeButtonClickSubscription?.unsubscribe();
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

  onFormDataChange(formData?: Partial<SpecimenTransaction>) {
    this.formData = formData;
    this.transactionFormEmbedService.updateEmbeddedComponents(formData);
  }

  setDisabled(disabled?: boolean) {
    if (disabled !== undefined) {
      this.disabled = disabled;
      this.transactionFormEmbedService.setEmbeddedComponentsDisabled(disabled);
    }
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

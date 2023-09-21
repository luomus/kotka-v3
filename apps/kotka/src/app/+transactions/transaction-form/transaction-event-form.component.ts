import { Component, Input, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../shared/services/toast.service';
import { Observable } from 'rxjs';
import { LajiForm, SpecimenTransaction, SpecimenTransactionEvent } from '@kotka/shared/models';
import { EnumOption, FormService } from '../../shared/services/api-services/form.service';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { map } from 'rxjs/operators';

@Component({
  selector: 'kotka-transaction-event-form',
  template: `
    <div class="modal-body">
      <h1>Add transaction event</h1>
      <ng-container *ngIf="form$ | async as form else spinner">
        <kui-laji-form
          [form]="form"
          [formData]="{}"
          [notifier]="notifier"
          [showFooter]="false"
          (formSubmit)="onSubmit($event)"
        >
        </kui-laji-form>
      </ng-container>
      <ng-template #spinner>
        <kui-spinner></kui-spinner>
      </ng-template>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-primary"
        (click)="onAddClick()"
        data-cy="confirm-ok"
      >
        OK
      </button>
      <button
        type="button"
        class="btn btn-default"
        (click)="modal.dismiss()"
      >
        Cancel
      </button>
    </div>
	`,
})
export class TransactionEventFormComponent {
  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  @Input() transactionType!: SpecimenTransaction['type'];

  form$: Observable<LajiForm.SchemaForm>;

  private eventTypeBlacklistByType: Partial<Record<SpecimenTransaction['type'], SpecimenTransactionEvent['eventType'][]>> = {
    'HRX.typeGiftIncoming': ['HRX.eventTypeReturn'],
    'HRX.typeGiftOutgoing': ['HRX.eventTypeReturn'],
    'HRX.typeExchangeIncoming': ['HRX.eventTypeReturn'],
    'HRX.typeExchangeOutgoing': ['HRX.eventTypeReturn']
  };

  constructor(
    public modal: NgbActiveModal,
    public notifier: ToastService,
    private formService: FormService
  ) {
    this.form$ = this.formService.getFormWithUserContext('MHL.1060').pipe(
      map(form => {
        const eventTypeBlacklist = this.eventTypeBlacklistByType[this.transactionType] || [];
        const eventTypeOptions = form.schema.properties.eventType.oneOf.filter((value: EnumOption) => (
          !eventTypeBlacklist.includes(value.const as SpecimenTransactionEvent['eventType'])
        ));

        form = {...form, schema: {...form.schema, properties: {...form.schema.properties, eventType: {
          ...form.schema.properties.eventType, oneOf: eventTypeOptions
        }}}};

        return form;
      })
    );
  }

  onAddClick() {
    this.lajiForm?.saveFormClicked();
  }

  onSubmit(data: SpecimenTransactionEvent) {
    this.modal.close(data);
  }
}

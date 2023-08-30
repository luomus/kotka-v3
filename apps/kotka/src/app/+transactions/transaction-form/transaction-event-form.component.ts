import { Component, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../shared/services/toast.service';
import { Observable } from 'rxjs';
import { LajiForm, SpecimenTransactionEvent } from '@kotka/shared/models';
import { FormService } from '../../shared/services/form.service';
import { LajiFormComponent } from '@kotka/ui/laji-form';

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

  form$: Observable<LajiForm.SchemaForm>;

  constructor(
    public modal: NgbActiveModal,
    public notifier: ToastService,
    private formService: FormService
  ) {
    this.form$ = this.formService.getForm('MHL.1060');
  }

  onAddClick() {
    this.lajiForm?.saveFormClicked();
  }

  onSubmit(data: SpecimenTransactionEvent) {
    this.modal.close(data);
  }
}

import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'kotka-transaction-event-form',
  template: `
    <div class="modal-body">
      <p>Transaction event</p>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-primary text-light"
        (click)="modal.close(true)"
        data-cy="confirm-ok"
      >
        OK
      </button>
    </div>
	`,
})
export class TransactionEventFormComponent {
  constructor(public modal: NgbActiveModal) {}
}

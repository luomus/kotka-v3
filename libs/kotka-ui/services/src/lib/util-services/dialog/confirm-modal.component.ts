import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  imports: [],
  selector: 'kui-confirm-modal',
  template: `
    <div class="modal-body">
      <p>{{ message }}</p>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-primary"
        (click)="modal.close(true)"
        data-cy="confirm-ok"
        >
        {{ confirmLabel }}
      </button>
      @if (showCancel) {
        <button
          type="button"
          class="btn btn-default"
          (click)="modal.dismiss()"
          >
          {{ cancelLabel }}
        </button>
      }
    </div>
    `,
})
export class ConfirmModalComponent {
  modal = inject(NgbActiveModal);

  message!: string;
  confirmLabel = 'OK';
  cancelLabel = 'cancel';
  showCancel = true;
}

import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
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
      <button
        type="button"
        *ngIf="showCancel"
        class="btn btn-default"
        (click)="modal.dismiss()"
      >
        {{ cancelLabel }}
      </button>
    </div>
  `,
})
export class ConfirmModalComponent {
  message!: string;
  confirmLabel = 'OK';
  cancelLabel = 'cancel';
  showCancel = true;

  constructor(public modal: NgbActiveModal) {}
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'kui-modal',
  template: `
    <div class="modal-header">
      <ng-content select="[kuiModalHeader]"></ng-content>
      <button
        type="button"
        class="btn btn-light ms-auto"
        (click)="modal.dismiss()"
        aria-label="Close"
      >
        <i class="fa fa-xmark"></i>
      </button>
    </div>
    <div class="modal-body">
      <ng-content></ng-content>
    </div>
    <div class="modal-footer">
      <ng-content select="[kuiModalFooter]"></ng-content>
    </div>
  `,
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class ModalComponent {
  modal = inject(NgbActiveModal);
}

import { Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DataOptions, Options } from '@luomus/laji-map';
import { LajiMapComponent } from '../../laji-map/laji-map.component';

@Component({
  selector: 'kui-viewer-map-modal',
  templateUrl: './viewer-map-modal.component.html',
  styleUrls: ['./viewer-map-modal.component.scss'],
  imports: [LajiMapComponent],
})
export class ViewerMapModalComponent {
  data = signal<DataOptions | undefined>(undefined);
  options = signal<Options | undefined>(undefined);

  activeModal = inject(NgbActiveModal);

  close() {
    this.activeModal.close();
  }
}

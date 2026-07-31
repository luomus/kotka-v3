import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewerComponent } from '../../../+view/specimen-viewer/specimen-viewer.component';

@Component({
  selector: 'kotka-specimen-viewer-modal',
  templateUrl: './specimen-viewer-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpecimenViewerComponent],
})
export class SpecimenViewerModalComponent {
  modal = inject(NgbActiveModal);
  uri!: string;
}


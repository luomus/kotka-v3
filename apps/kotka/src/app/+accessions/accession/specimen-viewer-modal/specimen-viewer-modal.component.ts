import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SpecimenViewerHeaderComponent } from '../../../+view/specimen-viewer/specimen-viewer-header/specimen-viewer-header.component';
import { SpecimenViewerContentComponent } from '../../../+view/specimen-viewer/specimen-viewer-content/specimen-viewer-content.component';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { SpecimenViewerDataService, SpecimenViewerViewModel } from '../../../+view/specimen-viewer/specimen-viewer-data.service';

@Component({
  selector: 'kotka-specimen-viewer-modal',
  templateUrl: './specimen-viewer-modal.component.html',
  styleUrl: './specimen-viewer-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpecimenViewerHeaderComponent, SpecimenViewerContentComponent, AsyncPipe],
})
export class SpecimenViewerModalComponent implements OnInit {
  modal = inject(NgbActiveModal);
  private specimenViewerDataService = inject(SpecimenViewerDataService);

  uri!: string;

  vm$!: Observable<SpecimenViewerViewModel>;

  ngOnInit() {
    this.vm$ = this.specimenViewerDataService.getViewModel$(of(this.uri));
  }
}

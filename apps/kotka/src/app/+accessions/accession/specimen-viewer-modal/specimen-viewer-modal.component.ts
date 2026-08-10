import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SpecimenViewerHeaderComponent } from '../../../+view/specimen-viewer/specimen-viewer-header/specimen-viewer-header.component';
import { SpecimenViewerContentComponent } from '../../../+view/specimen-viewer/specimen-viewer-content/specimen-viewer-content.component';
import { AsyncPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { SpecimenViewerDataService, SpecimenViewerViewModel } from '../../../+view/specimen-viewer/specimen-viewer-data.service';
import { ModalComponent, ModalHeaderDirective } from '@kotka/ui/components';

@Component({
  selector: 'kotka-specimen-viewer-modal',
  templateUrl: './specimen-viewer-modal.component.html',
  styleUrl: './specimen-viewer-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SpecimenViewerHeaderComponent,
    SpecimenViewerContentComponent,
    AsyncPipe,
    ModalComponent,
    ModalHeaderDirective,
  ],
})
export class SpecimenViewerModalComponent implements OnInit {
  private specimenViewerDataService = inject(SpecimenViewerDataService);

  uri!: string;

  vm$!: Observable<SpecimenViewerViewModel>;

  ngOnInit() {
    this.vm$ = this.specimenViewerDataService.getViewModel$(of(this.uri));
  }
}

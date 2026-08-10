import {
  Component,
  inject,
  input,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { DocumentNavigatorComponent, MainContentComponent } from '@kotka/ui/components';
import { KotkaRootDocumentType } from '@kotka/shared/models';
import { toObservable } from '@angular/core/rxjs-interop';
import { SpecimenViewerHeaderComponent } from './specimen-viewer-header/specimen-viewer-header.component';
import { SpecimenViewerContentComponent } from './specimen-viewer-content/specimen-viewer-content.component';
import { SpecimenViewerDataService } from './specimen-viewer-data.service';

export { SpecimenViewerViewModel } from './specimen-viewer-data.service';

@Component({
  selector: 'kotka-specimen-viewer',
  templateUrl: './specimen-viewer.component.html',
  imports: [
    AsyncPipe,
    MainContentComponent,
    SpecimenViewerHeaderComponent,
    SpecimenViewerContentComponent,
    DocumentNavigatorComponent,
  ],
  styleUrls: ['./specimen-viewer.component.scss'],
})
export class SpecimenViewerComponent {
  private specimenViewerDataService = inject(SpecimenViewerDataService);

  uri = input.required<string>();

  dataType = KotkaRootDocumentType.specimen;

  vm$ = this.specimenViewerDataService.getViewModel$(toObservable(this.uri));
}

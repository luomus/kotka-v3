import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaRootDocumentType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import {
  VersionHistoryViewComponent
} from '@kotka/ui/form-view';

@Component({
  selector: 'kotka-specimen-version-history',
  template: `
    <kotka-version-history-view
      [formId]="formId"
      [dataType]="dataType"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VersionHistoryViewComponent],
})
export class SpecimenVersionHistoryComponent {
  formId = globals.specimenFormId;
  dataType: KotkaRootDocumentType.specimen =
    KotkaRootDocumentType.specimen;
}

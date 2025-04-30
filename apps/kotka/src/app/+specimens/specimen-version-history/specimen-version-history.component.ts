import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
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
      [dataTypeName]="'specimen'"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VersionHistoryViewComponent],
})
export class SpecimenVersionHistoryComponent {
  formId = globals.specimenFormId;
  dataType: KotkaDocumentObjectType.specimen =
    KotkaDocumentObjectType.specimen;
}

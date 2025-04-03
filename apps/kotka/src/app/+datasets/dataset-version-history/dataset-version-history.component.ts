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
  selector: 'kotka-transaction-version-history',
  template: `
    <kotka-version-history-view
      [formId]="formId"
      [dataType]="dataType"
      [dataTypeName]="'tag'"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VersionHistoryViewComponent],
})
export class DatasetVersionHistoryComponent {
  formId = globals.datasetFormId;
  dataType: KotkaDocumentObjectType.dataset = KotkaDocumentObjectType.dataset;
}

import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaDocumentType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import {
  VersionHistoryViewComponent
} from '@kotka/ui/form-view';

@Component({
  selector: 'kotka-organization-version-history',
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
export class OrganizationVersionHistoryComponent {
  formId = globals.organizationFormId;
  dataType: KotkaDocumentType.organization =
    KotkaDocumentType.organization;
}

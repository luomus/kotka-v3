import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';

@Component({
  selector: 'kotka-organization-version-history',
  template: `
    <kotka-version-history-view
      [formId]="formId"
      [dataType]="dataType"
      [dataTypeName]="'organization'"
    ></kotka-version-history-view>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationVersionHistoryComponent {
  formId = globals.organizationFormId;
  dataType: KotkaDocumentObjectType.organization = KotkaDocumentObjectType.organization;
}

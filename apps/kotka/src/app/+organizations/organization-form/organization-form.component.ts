import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KotkaDocumentType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '@kotka/ui/form-view';
import { FormViewComponent } from '@kotka/ui/form-view';

@Component({
  selector: 'kotka-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  imports: [FormViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationFormComponent extends FormViewContainerComponent<KotkaDocumentType.organization> {
  formId = globals.organizationFormId;
  dataType: KotkaDocumentType.organization =
    KotkaDocumentType.organization;
}

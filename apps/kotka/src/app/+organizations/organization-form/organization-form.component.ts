import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '../../shared-modules/form-view/form-view/form-view-container';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';

@Component({
  selector: 'kotka-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
  imports: [FormViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationFormComponent extends FormViewContainerComponent {
  formId = globals.organizationFormId;
  dataType: KotkaDocumentObjectType.organization =
    KotkaDocumentObjectType.organization;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { isDataset, KotkaDocumentObjectType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '../../shared-modules/form-view/form-view/form-view-container';

@Component({
  selector: 'kotka-organization-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent extends FormViewContainerComponent {
  formId = globals.datasetFormId;
  dataType: KotkaDocumentObjectType.dataset = KotkaDocumentObjectType.dataset;

  protected readonly isDataset = isDataset;
}

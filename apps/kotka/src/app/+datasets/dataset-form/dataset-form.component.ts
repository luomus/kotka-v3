import { ChangeDetectionStrategy, Component } from '@angular/core';
import { isDataset, KotkaDocumentType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent, FormViewComponent } from '@kotka/ui/form-view';
import { OldKotkaUrlPipe } from '@kotka/ui/core';

@Component({
  selector: 'kotka-organization-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  imports: [FormViewComponent, OldKotkaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetFormComponent extends FormViewContainerComponent<KotkaDocumentType.dataset> {
  formId = globals.datasetFormId;
  dataType: KotkaDocumentType.dataset = KotkaDocumentType.dataset;

  protected readonly isDataset = isDataset;
}

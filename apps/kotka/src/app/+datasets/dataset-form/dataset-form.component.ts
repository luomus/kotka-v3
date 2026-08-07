import { ChangeDetectionStrategy, Component } from '@angular/core';
import { isDataset, KotkaRootDocumentType } from '@kotka/shared/models';
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
export class DatasetFormComponent extends FormViewContainerComponent<KotkaRootDocumentType.dataset> {
  formId = globals.datasetFormId;
  dataType: KotkaRootDocumentType.dataset = KotkaRootDocumentType.dataset;

  protected readonly isDataset = isDataset;
}

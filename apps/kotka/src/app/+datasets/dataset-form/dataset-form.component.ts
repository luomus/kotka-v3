import { ChangeDetectionStrategy, Component } from '@angular/core';
import { isDataset, KotkaDocumentObjectType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent, FormViewComponent } from '@kotka/ui/form-view';
import { CommonModule } from '@angular/common';
import { OldKotkaUrlPipe } from '@kotka/ui/pipes';

@Component({
  selector: 'kotka-organization-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  imports: [CommonModule, FormViewComponent, OldKotkaUrlPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetFormComponent extends FormViewContainerComponent {
  formId = globals.datasetFormId;
  dataType: KotkaDocumentObjectType.dataset = KotkaDocumentObjectType.dataset;

  protected readonly isDataset = isDataset;
}

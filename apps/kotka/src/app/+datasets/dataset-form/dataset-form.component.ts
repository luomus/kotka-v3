import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { isDataset, KotkaDocumentObjectType } from '@kotka/shared/models';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { ComponentCanDeactivate } from '../../shared/services/guards/component-can-deactivate.guard';
import { Observable } from 'rxjs';
import { globals } from '../../../environments/globals';
import { Dataset } from '@luomus/laji-schema';

@Component({
  selector: 'kotka-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent implements ComponentCanDeactivate {
  formId = globals.datasetFormId;
  dataType = KotkaDocumentObjectType.dataset;

  datasetQuery?: string;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent;

  canDeactivate(): Observable<boolean> {
    return this.formView.canDeactivate();
  }

  updateDatasetQuery(formData: Partial<Dataset>) {
    if (isDataset(formData)) {
      this.datasetQuery = formData.datasetName.en;
    }
  }
}

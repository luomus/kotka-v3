import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { DataType } from '../../shared/services/api-services/data.service';
import { Dataset, Person, isDataset } from '@kotka/shared/models';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { ComponentCanDeactivate } from '../../shared/services/guards/component-can-deactivate.guard';
import { Observable } from 'rxjs';

@Component({
  selector: 'kotka-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent implements ComponentCanDeactivate {
  dataType = DataType.dataset;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent;

  canDeactivate(): Observable<boolean> {
    return this.formView.canDeactivate();
  }

  getInitialFormData(user: Person): Partial<Dataset> {
    const formData: Partial<Dataset> = {};
    if (user?.organisation && user.organisation.length === 1) {
      formData.owner = user.organisation[0];
    }
    return formData;
  }

  asDataset(value: any): Dataset|undefined {
    if (isDataset(value)) {
      return value as Dataset;
    }
    return undefined;
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataType } from '../../shared/services/api.service';
import { Dataset, Person, isDataset } from '@kotka/shared/models';

@Component({
  selector: 'kotka-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent {
  dataType = DataType.dataset;

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

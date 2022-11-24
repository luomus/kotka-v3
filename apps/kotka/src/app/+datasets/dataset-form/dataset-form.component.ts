import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataType } from '../../shared/services/api.service';
import { Dataset, Person } from '@kotka/shared/models';

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
    if (user?.organisation && user.organisation.length > 0) {
      formData.owner = user.organisation[0];
    }
    return formData;
  }
}

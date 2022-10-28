import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataType } from '../../shared/services/api.service';

@Component({
  selector: 'kotka-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent {
  dataType = DataType.dataset;
}

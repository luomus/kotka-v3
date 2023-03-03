import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataType } from '../../shared/services/data.service';
import { Dataset, Person } from '@kotka/shared/models';

@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent {
  dataType = DataType.transaction;

  getInitialFormData(user: Person): Partial<Dataset> {
    const formData: Partial<Dataset> = {};
    if (user?.organisation && user.organisation.length === 1) {
      formData.owner = user.organisation[0];
    }
    return formData;
  }
}

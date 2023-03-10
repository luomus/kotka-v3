import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DataType } from '../../shared/services/data.service';
import { Dataset, LajiForm, Person } from '@kotka/shared/models';
import { Observable, of, switchMap } from 'rxjs';
import { FormService } from '../../shared/services/form.service';

@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent {
  dataType = DataType.transaction;

  constructor(
    private formService: FormService
  ) {}


  augmentForm(form: LajiForm.SchemaForm): Observable<LajiForm.SchemaForm> {
    return this.formService.getAllCountryOptions().pipe(switchMap(countries => {
      form.schema.properties.geneticResourceAcquisitionCountry.oneOf = countries;
      return of(form);
    }));
  }

  getInitialFormData(user: Person): Partial<Dataset> {
    const formData: Partial<Dataset> = {};
    if (user?.organisation && user.organisation.length === 1) {
      formData.owner = user.organisation[0];
    }
    return formData;
  }
}

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormService } from '../../shared/services/form.service';
import { Form } from '../../../../../../libs/shared/models/src/models/LajiForm';
import { Observable } from 'rxjs';

@Component({
  selector: 'kotka-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent implements OnInit {
  datasetForm$: Observable<Form.SchemaForm>;

  constructor(
    private formService: FormService
  ) {
    this.datasetForm$ = this.formService.getForm('MHL.731');
  }

  ngOnInit(): void {}
}

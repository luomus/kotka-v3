import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { Dataset, isDataset } from '@kotka/shared/models';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import { ComponentCanDeactivate } from '../../shared/services/guards/component-can-deactivate.guard';
import { Observable } from 'rxjs';
import { KotkaObjectType } from '@kotka/api-interfaces';

@Component({
  selector: 'kotka-dataset-form',
  templateUrl: './dataset-form.component.html',
  styleUrls: ['./dataset-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatasetFormComponent implements ComponentCanDeactivate {
  dataType = KotkaObjectType.dataset;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent<KotkaObjectType.dataset>;

  canDeactivate(): Observable<boolean> {
    return this.formView.canDeactivate();
  }

  asDataset(value: unknown): Dataset|undefined {
    if (isDataset(value)) {
      return value as Dataset;
    }
    return undefined;
  }
}

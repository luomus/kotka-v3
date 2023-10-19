import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { asDataset, isDataset, KotkaDocumentObjectType } from '@kotka/shared/models';
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
  dataType = KotkaDocumentObjectType.dataset;

  isDataset = isDataset;
  asDataset = asDataset;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent;

  canDeactivate(): Observable<boolean> {
    return this.formView.canDeactivate();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import {
  DifferenceObject,
  KotkaDocumentObject,
  LajiForm,
} from '@kotka/shared/models';
import { ViewerFieldsetFieldsComponent } from './components/viewer-fieldset-fields.component';


@Component({
  selector: 'kui-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldsetFieldsComponent],
})
export class ViewerComponent {
  fields = input<LajiForm.Field[]>([]);
  data = input<KotkaDocumentObject | undefined>();
  differenceData = input<DifferenceObject>();
}

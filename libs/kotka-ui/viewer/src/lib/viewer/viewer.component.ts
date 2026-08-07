import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from '@angular/core';
import {
  DifferenceObject,
  KotkaRootDocument,
} from '@kotka/shared/models';
import { ViewerFieldsetFieldsComponent } from '../components/viewer-fieldset-fields.component';
import { ViewerField } from '../models/models';

@Component({
  selector: 'kui-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerFieldsetFieldsComponent],
})
export class ViewerComponent {
  fields = input<ViewerField[]>([]);
  data = input<KotkaRootDocument | undefined>();
  differenceData = input<DifferenceObject>();
}

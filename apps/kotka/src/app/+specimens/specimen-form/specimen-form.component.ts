import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '@kotka/ui/form-view';
import { FormViewComponent } from '@kotka/ui/form-view';

@Component({
  selector: 'kotka-specimen-form',
  templateUrl: './specimen-form.component.html',
  styleUrls: ['./specimen-form.component.scss'],
  imports: [FormViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpecimenFormComponent extends FormViewContainerComponent {
  formId = globals.specimenFormId;
  dataType: KotkaDocumentObjectType.specimen =
    KotkaDocumentObjectType.specimen;
}

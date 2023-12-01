import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { KotkaDocumentObject } from '@kotka/shared/models';

@Component({
  selector: 'kotka-meta-fields',
  templateUrl: './meta-fields.component.html',
  styleUrls: ['./meta-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetaFieldsComponent {
  @Input() formData?: Partial<KotkaDocumentObject>;
  @Input() editMode?: boolean;
  @Input() dataURI?: string;

  @Input() extraSectionTpl?: TemplateRef<any>;
}

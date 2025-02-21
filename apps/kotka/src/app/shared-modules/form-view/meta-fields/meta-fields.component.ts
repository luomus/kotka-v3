import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { KotkaDocumentObject } from '@kotka/shared/models';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LabelPipe } from '@kotka/ui/pipes';

@Component({
  selector: 'kotka-meta-fields',
  templateUrl: './meta-fields.component.html',
  styleUrls: ['./meta-fields.component.scss'],
  imports: [CommonModule, RouterLink, LabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaFieldsComponent {
  @Input() formData?: Partial<KotkaDocumentObject>;
  @Input() editMode?: boolean;
  @Input() dataURI?: string;

  @Input() extraSectionTpl?: TemplateRef<unknown>;
}

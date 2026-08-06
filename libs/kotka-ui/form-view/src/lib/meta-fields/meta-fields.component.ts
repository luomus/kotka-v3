import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
} from '@angular/core';
import { MainKotkaDocumentObject } from '@kotka/shared/models';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LabelPipe } from '@kotka/ui/core';

@Component({
  selector: 'kotka-meta-fields',
  templateUrl: './meta-fields.component.html',
  styleUrls: ['./meta-fields.component.scss'],
  imports: [CommonModule, RouterLink, LabelPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaFieldsComponent {
  formData = input<Partial<MainKotkaDocumentObject>>();
  editMode = input<boolean>();
  dataURI = input<string>();
  historyPageLink = input<string[]|string>();

  containerTpl = input<TemplateRef<unknown>>();
}

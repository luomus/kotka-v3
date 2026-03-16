import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';


@Component({
  selector: 'kui-form-footer',
  templateUrl: './form-footer.component.html',
  styleUrls: ['./form-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class FormFooterComponent {
  hasChanges = input<boolean>();
  disabled = input<boolean>();
  hasOnlyWarnings = input<boolean>();
  showDeleteButton = input<boolean>();
  showCopyButton = input<boolean>();
  customButtonsTpl = input<TemplateRef<unknown>>();

  saveForm = output<void>();
  highlightErrors = output<void>();
  delete = output<void>();
  copyForm = output<void>();
  saveAndCopyForm = output<void>();
}

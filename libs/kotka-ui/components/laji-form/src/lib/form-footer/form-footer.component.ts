import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kui-form-footer',
  templateUrl: './form-footer.component.html',
  styleUrls: ['./form-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class FormFooterComponent {
  @Input() hasChanges? = false;
  @Input() disabled? = false;
  @Input() hasOnlyWarnings? = false;
  @Input() showDeleteButton? = false;
  @Input() showCopyButton? = false;

  @Output() saveForm: EventEmitter<void> = new EventEmitter<void>();
  @Output() highlightErrors: EventEmitter<void> = new EventEmitter<void>();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() copyForm: EventEmitter<void> = new EventEmitter<void>();
  @Output() saveAndCopyForm: EventEmitter<void> = new EventEmitter<void>();
}

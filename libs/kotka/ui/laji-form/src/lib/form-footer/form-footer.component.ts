import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

@Component({
  selector: 'kui-form-footer',
  templateUrl: './form-footer.component.html',
  styleUrls: ['./form-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFooterComponent {
  @Input() disabled = false;
  @Input() hasOnlyWarnings = false;
  @Input() showDeleteButton = false;
  @Input() showCopyButton = false;

  @Output() saveForm: EventEmitter<void> = new EventEmitter<void>();
  @Output() highlightErrors: EventEmitter<void> = new EventEmitter<void>();
  @Output() delete: EventEmitter<void> = new EventEmitter<void>();
  @Output() copyForm: EventEmitter<void> = new EventEmitter<void>();
}

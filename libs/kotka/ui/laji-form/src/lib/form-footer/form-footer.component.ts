import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'kui-form-footer',
  templateUrl: './form-footer.component.html',
  styleUrls: ['./form-footer.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFooterComponent {
  @Output() saveForm: EventEmitter<void> = new EventEmitter<void>();
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import {
  DATE_FORMAT_PLACEHOLDERS,
  DateFormat,
  KotkaDateParserFormatter,
  KotkaDateAdapter,
  formatDate,
  parseDate
} from './date-format';

@Component({
  selector: 'kui-datepicker',
  template: `
    <div class="input-group">
      <input
        [class.is-invalid]="isInvalid()"
        class="form-control"
        [placeholder]="placeholderText()"
        [(ngModel)]="datePickerModel"
        ngbDatepicker
        #datepicker="ngbDatepicker"
        [container]="'body'"
      />
      <button
        type="button"
        class="btn btn-outline-secondary"
        aria-label="Toggle datepicker"
        (click)="datepicker.toggle()"
      >
        <i class="fa fa-calendar-days"></i>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, NgbInputDatepicker],
  providers: [
    { provide: NgbDateAdapter, useClass: KotkaDateAdapter },
    { provide: NgbDateParserFormatter, useClass: KotkaDateParserFormatter },
  ],
})
export class DatepickerComponent {
  value = model<string>('');

  inputDateFormat = input<DateFormat>('finnish');
  resultDateFormat = input<DateFormat>('iso');

  placeholder = input<string>();

  parsedDate = computed(() => (
    parseDate(this.value(), this.resultDateFormat())
  ));
  datePickerModel = signal<Date | string | null>(null);

  placeholderText = computed(
    () =>
      this.placeholder() ?? DATE_FORMAT_PLACEHOLDERS[this.inputDateFormat()],
  );

  isInvalid = signal(false);

  constructor() {
    const parserFormatter = inject(NgbDateParserFormatter) as KotkaDateParserFormatter;

    effect(() => {
      parserFormatter.setDateFormat(this.inputDateFormat());
    });

    effect(() => {
      const date = this.parsedDate();
      if (date) {
        this.datePickerModel.set(date);
      }
    });

    effect(() => {
      const date = this.datePickerModel();
      if (date instanceof Date) {
        this.value.set(formatDate(date, this.resultDateFormat()));
        this.isInvalid.set(false);
      } else {
        this.value.set('');
        this.isInvalid.set(!!date);
      }
    });
  }
}

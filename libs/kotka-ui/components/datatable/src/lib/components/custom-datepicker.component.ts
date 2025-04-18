import { Component, ElementRef, Injectable, ViewChild } from '@angular/core';
import { IDateAngularComp } from '@ag-grid-community/angular';
import { IDateParams } from '@ag-grid-community/core';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbDateStruct,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

/**
 * This Service handles how the date is represented in scripts i.e. ngModel.
 */
@Injectable()
export class CustomAdapter extends NgbDateAdapter<Date> {
  fromModel(value: Date | string | null): NgbDateStruct | null {
    if (value && typeof value !== 'string') {
      return {
        day: value.getDate(),
        month: value.getMonth() + 1,
        year: value.getFullYear(),
      };
    }
    return null;
  }

  toModel(date: NgbDateStruct | null): Date | null {
    return date ? new Date(date.year, date.month - 1, date.day) : null;
  }
}

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  readonly DELIMITER = '.';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      const date = value.split(this.DELIMITER);
      return {
        day: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        year: parseInt(date[2], 10),
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    if (date) {
      return (
        ('0' + date.day).slice(-2) +
        this.DELIMITER +
        ('0' + date.month).slice(-2) +
        this.DELIMITER +
        date.year
      );
    }
    return '';
  }
}

@Component({
  imports: [NgbInputDatepicker, FormsModule],
  template: `
    <div class="input-group">
      <input
        class="ag-input-field-input ag-text-field-input"
        name="datepicker"
        placeholder="dd.mm.yyyy"
        [(ngModel)]="datepickerModel"
        (ngModelChange)="onDateChanged()"
        ngbDatepicker
        #datepicker="ngbDatepicker"
        [container]="'body'"
        [datepickerClass]="'ag-custom-component-popup'"
      />
      <button
        class="btn btn-outline-secondary"
        (click)="datepicker.toggle()"
        type="button"
      >
        <i class="fa fa-calendar-days"></i>
      </button>
    </div>
  `,
  styles: [
    `
      input {
        position: relative;
        flex: 1 1 auto;
        width: 1%;
        min-width: 0;
        height: var(--ag-list-item-height);
      }

      button {
        height: var(--ag-list-item-height);
        font-size: 0.7rem;
        padding-top: 0.1rem;
        padding-bottom: 0.1rem;
      }
    `,
  ],
  providers: [
    { provide: NgbDateAdapter, useClass: CustomAdapter },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class CustomDatepickerComponent implements IDateAngularComp {
  @ViewChild('datepicker', { read: ElementRef }) inputElem!: ElementRef;

  datepickerModel: Date | string | null = null;

  private date: Date | null = null;
  private params!: IDateParams;

  agInit(params: IDateParams) {
    this.params = params;
  }

  onDateChanged() {
    this.date =
      typeof this.datepickerModel === 'string' ? null : this.datepickerModel;
    this.params.onDateChanged();
  }

  getDate(): Date | null {
    return this.date;
  }

  setDate(date: Date | null) {
    this.date = date || null;
    this.datepickerModel = this.date;
  }
}

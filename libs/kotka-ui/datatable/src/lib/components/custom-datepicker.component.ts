import { Component, ElementRef, ViewChild } from '@angular/core';
import { IDateAngularComp } from '@ag-grid-community/angular';
import { IDateParams } from '@ag-grid-community/core';
import {
  NgbDateAdapter,
  NgbDateParserFormatter,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import {
  KotkaDateAdapter,
  KotkaDateParserFormatter,
} from '@kotka/ui/components';

function finnishDateParserFormatter(): KotkaDateParserFormatter {
  const parserFormatter = new KotkaDateParserFormatter();
  parserFormatter.setDateFormat('finnish');
  return parserFormatter;
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
    { provide: NgbDateAdapter, useClass: KotkaDateAdapter },
    { provide: NgbDateParserFormatter, useFactory: finnishDateParserFormatter },
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

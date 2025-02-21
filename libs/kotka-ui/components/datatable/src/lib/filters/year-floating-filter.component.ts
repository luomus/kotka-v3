import { Component } from '@angular/core';
import {
  DateFilter,
  DateFilterModel,
  IFloatingFilterParams,
} from '@ag-grid-community/core';
import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { LajiForm } from '@kotka/shared/models';
import { KeyValuePipe, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FilterExtraParams {
  field: LajiForm.Field;
}

@Component({
  standalone: true,
  imports: [KeyValuePipe, NgForOf, FormsModule],
  template: `
    <div class="ag-floating-filter-input">
      <div class="ag-select ag-filter-select">
        <select
          class="ag-picker-field-wrapper"
          [ngModel]="currentFilter"
          (ngModelChange)="changeFilterValue($event)"
        >
          <option></option>
          <option *ngFor="let year of years" [value]="year">
            {{ year }}
          </option>
        </select>
      </div>
    </div>
  `,
  styles: [
    `
      .ag-picker-field-wrapper {
        height: var(--ag-list-item-height);
        border-radius: var(--ag-border-radius);
      }
    `,
  ],
})
export class YearFloatingFilterComponent
  implements IFloatingFilterAngularComp<DateFilter>
{
  params!: IFloatingFilterParams & FilterExtraParams;

  currentFilter?: string;

  years: number[] = [];

  constructor() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
      this.years.push(i);
    }
  }

  agInit(params: IFloatingFilterParams<DateFilter> & FilterExtraParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: DateFilterModel | null) {
    if (!parentModel?.dateFrom) {
      this.currentFilter = undefined;
    } else {
      this.currentFilter = parentModel.dateFrom.split('-')[0];
    }
  }

  changeFilterValue(value: string | null = null) {
    const year = value ? parseInt(value, 10) : null;

    this.params.parentFilterInstance((instance) => {
      if (year) {
        (instance as any).setModelIntoUi({
          type: 'inRange',
          dateFrom: year + '-01-01',
          dateTo: year + '-12-31',
        });
        (instance as any).onUiChanged(true);
      } else {
        instance.onFloatingFilterChanged(null, null);
      }
    });
  }
}

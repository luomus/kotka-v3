import { Component } from '@angular/core';
import {
  IFloatingFilterParams,
  TextFilter,
  TextFilterModel
} from '@ag-grid-community/core';
import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { LajiForm } from '@kotka/shared/models';
import { KeyValuePipe, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FilterExtraParams {
  field: LajiForm.Field
}

@Component({
  standalone: true,
  imports: [
    KeyValuePipe,
    NgForOf,
    FormsModule
  ],
  template: `
    <div class="ag-floating-filter-input">
      <select class="ag-picker-field-wrapper" [ngModel]="currentFilter" (ngModelChange)="changeFilterValue($event)">
        <option *ngFor="let item of valueOptions | keyvalue" [value]="item.key">
          {{ item.value }}
        </option>
      </select>
    </div>
  `,
})
export class EnumFloatingFilterComponent implements IFloatingFilterAngularComp<TextFilter> {
  valueOptions!: Record<string, string>;

  currentFilter?: string;

  private params!: IFloatingFilterParams & FilterExtraParams;

  agInit(params: IFloatingFilterParams<TextFilter> & FilterExtraParams): void {
    this.params = params;
    this.valueOptions = {...params.field.options?.value_options, '':''};
  }

  onParentModelChanged(parentModel: TextFilterModel|null) {
    if (!parentModel?.filter) {
      this.currentFilter = undefined;
    } else {
      this.currentFilter = parentModel.filter;
    }
  }

  changeFilterValue(value: string|null = null) {
    this.params.parentFilterInstance(instance => {
      instance.onFloatingFilterChanged('equals', value);
    });
  }
}

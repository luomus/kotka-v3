import { Component } from '@angular/core';
import {
  IFloatingFilterParams,
  ISimpleFilter
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
        <option *ngFor="let item of params.field.options?.value_options | keyvalue" [value]="item.key">
          {{ item.value }}
        </option>
      </select>
    </div>
  `,
})
export class EnumFloatingFilterComponent implements IFloatingFilterAngularComp {
  params!: IFloatingFilterParams & FilterExtraParams;

  currentFilter?: string;

  agInit(params: IFloatingFilterParams<ISimpleFilter> & FilterExtraParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: any) {
    if (!parentModel) {
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

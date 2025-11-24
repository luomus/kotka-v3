import { Component } from '@angular/core';
import {
  IFloatingFilterParams,
  TextFilter,
  TextFilterModel,
} from '@ag-grid-community/core';
import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { LajiForm } from '@kotka/shared/models';
import { KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FilterExtraParams {
  field: LajiForm.Field;
}

@Component({
  imports: [KeyValuePipe, FormsModule],
  template: `
    <div class="ag-floating-filter-input">
      <div class="ag-select ag-filter-select">
        <select
          class="ag-picker-field-wrapper"
          [ngModel]="currentFilter"
          (ngModelChange)="changeFilterValue($event)"
          >
          @for (item of valueOptions | keyvalue; track item) {
            <option
              [value]="item.key"
              >
              {{ item.value }}
            </option>
          }
        </select>
      </div>
    </div>
    `,
  styles: [
    `
      .ag-select {
        min-width: 0;
      }
      .ag-picker-field-wrapper {
        min-width: 0;
        height: var(--ag-list-item-height);
        border-radius: var(--ag-border-radius);
      }
    `,
  ],
})
export class EnumFloatingFilterComponent
  implements IFloatingFilterAngularComp<TextFilter>
{
  valueOptions!: Record<string, string>;

  currentFilter?: string;

  private params!: IFloatingFilterParams & FilterExtraParams;

  agInit(params: IFloatingFilterParams<TextFilter> & FilterExtraParams): void {
    this.params = params;
    this.valueOptions = { ...params.field.options?.value_options, '': '' };
  }

  onParentModelChanged(parentModel?: TextFilterModel | null) {
    if (!parentModel?.filter) {
      this.currentFilter = undefined;
    } else {
      this.currentFilter = parentModel.filter;
    }
  }

  changeFilterValue(value: string | null = null) {
    this.params.parentFilterInstance((instance) => {
      instance.onFloatingFilterChanged('equals', value);
    });
  }
}

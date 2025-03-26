import { Component } from '@angular/core';
import { IFloatingFilterParams } from '@ag-grid-community/core';
import { IFloatingFilterAngularComp } from '@ag-grid-community/angular';
import { NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BooleanFilterComponent } from './boolean-filter.component';
import { LabelPipe } from '@kotka/ui/pipes';
import { BooleanFilterModel } from '../models/models';

@Component({
  imports: [NgForOf, FormsModule, LabelPipe],
  template: `
    <div class="ag-floating-filter-input">
      <div class="ag-select ag-filter-select">
        <select
          class="ag-picker-field-wrapper"
          [(ngModel)]="value"
          (ngModelChange)="updateFilter()"
        >
          <option
            *ngFor="let option of [undefined, true, false]"
            [ngValue]="option"
          >
            {{ option | label }}
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
export class BooleanFloatingFilterComponent
  implements IFloatingFilterAngularComp<BooleanFilterComponent>
{
  value?: boolean;

  private params!: IFloatingFilterParams<BooleanFilterComponent>;

  agInit(params: IFloatingFilterParams<BooleanFilterComponent>): void {
    this.params = params;
  }

  onParentModelChanged(parentModel?: BooleanFilterModel | null) {
    if (!parentModel) {
      this.value = undefined;
    } else {
      this.value = parentModel.filter;
    }
  }

  updateFilter() {
    this.params.parentFilterInstance((instance) => {
      instance.onFloatingFilterChanged(this.value);
    });
  }
}

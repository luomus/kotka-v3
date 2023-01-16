import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'uri-cell-renderer',
  template: `
    <div *ngIf="value" class="uri-cell-layout">
      <a type="button" class="btn btn-info text-light edit-button" [routerLink]="['edit']" [queryParams]="{
        uri: domain + value
      }">
        <i class="fa fa-pen-to-square"></i>
      </a>
      <small class="domain-value">{{ domain }}</small>
      <span class="id-value" title="{{ value }}">{{ value }}</span>
    </div>
  `,
  styles: [`
    .uri-cell-layout {
      display: inline-grid;
      grid-template-columns: auto auto;
      grid-template-rows: auto auto;
      grid-template-areas:
        "button domain"
        "button id";
      column-gap: 2px;
    }
    .uri-cell-layout .edit-button {
      grid-area: button;
    }
    .uri-cell-layout .domain-value {
      grid-area: domain;
      line-height: initial;
      font-size: 60%;
    }
    .uri-cell-layout .id-value {
      grid-area: id;
      line-height: initial;
    }
  `]
})
export class URICellRenderer implements ICellRendererAngularComp {
  value = '';
  domain = '';

  agInit(params: any): void {
    this.value = params.getValue();
    this.domain = params.domain;
  }

  refresh(params: ICellRendererParams<any>): boolean {
    return false;
  }
}

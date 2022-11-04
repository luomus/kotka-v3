import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: 'uri-cell-renderer',
  template: `
    <div *ngIf="value" class="uri-cell-layout">
      <a id="editButton" type="button" class="btn btn-info" [routerLink]="['edit']" [queryParams]="{
        uri: domain + value
      }">
        <i class="fa fa-pen-to-square"></i>
      </a>
      <small id="domainValue">{{ domain }}</small>
      <span id="idValue" title="{{ value }}">{{ value }}</span>
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
    .uri-cell-layout #editButton {
      grid-area: button;
    }
    .uri-cell-layout #domainValue {
      grid-area: domain;
      line-height: initial;
      font-size: 60%;
    }
    .uri-cell-layout #idValue {
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

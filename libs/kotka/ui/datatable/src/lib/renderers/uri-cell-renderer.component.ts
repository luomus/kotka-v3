import { Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CellRendererComponent } from './cell-renderer';

interface RendererExtraParams {
  domain: string;
}

type RendererParams = ICellRendererParams & RendererExtraParams;

@Component({
  selector: 'kui-uri-cell-renderer',
  template: `
    <div *ngIf="params.value" class="uri-cell-layout">
      <a type="button" class="btn btn-info edit-button" [routerLink]="['edit']" [queryParams]="{
        uri: params.domain + params.value
      }">
        <i class="fa fa-pen-to-square"></i>
      </a>
      <small class="domain-value">{{ params.domain }}</small>
      <span class="id-value" title="{{ params.value }}">{{ params.value }}</span>
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
export class URICellRendererComponent extends CellRendererComponent<RendererParams> {
  static override getExportValue(value: string, row: any, params: RendererExtraParams): string {
    if (!value) {
      return '';
    }
    return params.domain + value;
  }
}

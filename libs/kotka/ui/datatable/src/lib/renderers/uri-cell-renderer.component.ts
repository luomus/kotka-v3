import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CellRendererComponent } from './cell-renderer';
import { getDomainAndIdWithoutPrefix, getUri } from '@kotka/shared/utils';

@Component({
  selector: 'kui-uri-cell-renderer',
  template: `
    <div *ngIf="id" class="uri-cell-layout">
      <a type="button" class="btn btn-info edit-button" [routerLink]="['edit']" [queryParams]="{
        uri: domain + id
      }">
        <i class="fa fa-pen-to-square"></i>
      </a>
      <small class="domain-value">{{ domain }}</small>
      <span class="id-value" title="{{ id }}">{{ id }}</span>
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class URICellRendererComponent extends CellRendererComponent<ICellRendererParams> {
  domain = '';
  id = '';

  override paramsChange() {
    if (!this.params.value) {
      this.domain = '';
      this.id = '';
      return;
    }

    const [domain, id] = getDomainAndIdWithoutPrefix(this.params.value);
    this.domain = domain;
    this.id = id;
  }

  static override getExportValue(value: string): string {
    if (!value) {
      return '';
    }
    return getUri(value);
  }
}

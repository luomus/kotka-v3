import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CellRendererComponent } from './cell-renderer';
import { getDomainAndIdWithoutPrefix, getUri } from '@kotka/shared/utils';
import { RouterLink } from '@angular/router';


export interface URICellRendererParams {
  showEditLink?: boolean;
  editRouterLink?: string[];
  getEditRouterQueryParams?: (data: any) => Record<string, string>;
  showViewLink?: boolean;
  viewRouterLink?: string[];
  getViewRouterQueryParams?: (data: any) => Record<string, string>;
}

type RendererParams = ICellRendererParams & URICellRendererParams;

@Component({
  selector: 'kui-uri-cell-renderer',
  template: `
    @if (id) {
      <div class="uri-cell-layout" [class.has-edit-button]="showEditLink">
        @if (showEditLink) {
          <a
            type="button"
            class="btn btn-info edit-button"
            [routerLink]="editRouterLink"
            [queryParams]="editRouterQueryParams"
          >
            <i class="fa fa-pen-to-square"></i>
          </a>
        }
        @if (showViewLink) {
          <a
            class="view-link"
            [routerLink]="viewRouterLink"
            [queryParams]="viewRouterQueryParams"
          >
            <small class="domain-value">{{ domain }}</small>
            <span class="id-value" title="{{ id }}">{{ id }}</span>
          </a>
        } @else {
          <small class="domain-value">{{ domain }}</small>
          <span class="id-value" title="{{ id }}">{{ id }}</span>
        }
      </div>
    }
  `,
  styles: [
    `
      .uri-cell-layout {
        display: inline-grid;
        grid-template-columns: auto;
        grid-template-rows: auto auto;
        grid-template-areas:
          'domain'
          'id';
        column-gap: 2px;
      }

      .uri-cell-layout.has-edit-button {
        grid-template-columns: auto auto;
        grid-template-areas:
          'button domain'
          'button id';
      }

      .uri-cell-layout .edit-button {
        grid-area: button;
      }

      .uri-cell-layout .view-link {
        display: contents;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class URICellRendererComponent extends CellRendererComponent<RendererParams> {
  domain = '';
  id = '';

  showEditLink = true;
  editRouterLink: string[] | string = 'edit';
  editRouterQueryParams?: Record<string, string>;

  showViewLink = false;
  viewRouterLink: string[] | string = '/view';
  viewRouterQueryParams?: Record<string, string>;

  override paramsChange() {
    if (!this.params.value) {
      this.domain = '';
      this.id = '';
      return;
    }

    const [domain, id] = getDomainAndIdWithoutPrefix(this.params.value);
    const uri = domain + id;

    this.domain = domain;
    this.id = id;

    this.showEditLink = this.params.showEditLink ?? true;
    this.editRouterLink = this.params.editRouterLink || 'edit';
    this.editRouterQueryParams = this.params.getEditRouterQueryParams ? this.params.getEditRouterQueryParams(this.params.data) : { uri };

    this.showViewLink = this.params.showViewLink ?? false;
    this.viewRouterLink = this.params.viewRouterLink || '/view';
    this.viewRouterQueryParams = this.params.getViewRouterQueryParams ? this.params.getViewRouterQueryParams(this.params.data) : { uri };
  }

  static override getExportValue(value: string): string {
    if (!value) {
      return '';
    }
    return getUri(value);
  }
}

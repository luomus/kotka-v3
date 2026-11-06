import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core';
import {
  KotkaDocumentType,
} from '@kotka/shared/models';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '../spinner/spinner.component';
import { DocumentSortData, SearchResultIteratorService } from '@kotka/ui/core';
import { Subscription } from 'rxjs';

interface NavigatorState {
  loading: boolean;
  previous?: DocumentSortData;
  next?: DocumentSortData;
}

@Component({
  selector: 'kui-document-navigator',
  template: `
    @if (navigatorState().loading ||
    navigatorState().previous ||
    navigatorState().next) {
      <kui-spinner
        [spinning]="navigatorState().loading"
        [hideContentWhileLoading]="true"
      >
        <div class="d-flex gap-0 d-sm-block">
          @if (navigatorState().previous; as previous) {
            <a
              class="btn btn-light flex-grow-1 me-1"
              [routerLink]="buttonRouterLink()"
              [queryParams]="{ uri: previous.documentURI }"
              (click)="onNavigationLinkClick(previous)"
            >
              <i class="fa fa-angle-left"></i>
            </a>
          } @else {
            <button class="btn btn-light flex-grow-1 me-1" disabled>
              <i class="fa fa-angle-left"></i>
            </button>
          }
          @if (navigatorState().next; as next) {
            <a
              class="btn btn-light flex-grow-1 ms-1"
              [routerLink]="buttonRouterLink()"
              [queryParams]="{ uri: next.documentURI }"
              (click)="onNavigationLinkClick(next)"
            >
              <i class="fa fa-angle-right"></i>
            </a>
          } @else {
            <button class="btn btn-light flex-grow-1 ms-1" disabled>
              <i class="fa fa-angle-right"></i>
            </button>
          }
        </div>
      </kui-spinner>
    }
  `,
  imports: [RouterLink, SpinnerComponent],
})
export class DocumentNavigatorComponent<
  T extends KotkaDocumentType = KotkaDocumentType,
> implements OnDestroy
{
  private searchResultIteratorService = inject(SearchResultIteratorService);

  dataType = input.required<T>();
  uri = input<string>();
  buttonRouterLink = input.required<string>();

  navigatorState = signal<NavigatorState>({ loading: false });

  private navigatorDataSub?: Subscription;

  constructor() {
    effect(() => {
      const type = this.dataType();
      const uri = this.uri();

      if (uri) {
        this.navigatorDataSub?.unsubscribe();

        this.navigatorState.set({ loading: true });

        this.navigatorDataSub = this.searchResultIteratorService.getState(type, uri).subscribe({
          next: (state) => {
            this.navigatorState.set({ loading: false, ...state });
          },
          error: () => {
            this.navigatorState.set({ loading: false });
          },
        });
      } else {
        this.navigatorState.set({ loading: false });
      }
    });
  }

  ngOnDestroy() {
    this.navigatorDataSub?.unsubscribe();
  }

  onNavigationLinkClick(data: DocumentSortData) {
    this.searchResultIteratorService.setCurrentData(
      this.dataType(),
      data
    );
  }
}


import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core';
import {
  KotkaDocumentObjectMap,
  KotkaDocumentObjectType,
} from '@kotka/shared/models';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ToFullUriPipe, SearchResultIteratorService } from '@kotka/ui/core';
import { forkJoin, Subscription } from 'rxjs';

interface NavigatorState {
  loading: boolean;
  previousId?: string;
  nextId?: string;
}

@Component({
  selector: 'kui-document-navigator',
  template: `
    @if (navigatorState().loading || navigatorState().previousId || navigatorState().nextId) {
      <kui-spinner [spinning]="navigatorState().loading" [hideContentWhileLoading]="true">
        <div class="d-flex gap-0 d-sm-block">
          @if (navigatorState().previousId) {
            <a
              class="btn btn-light flex-grow-1 me-1"
              [routerLink]="buttonRouterLink()"
              [queryParams]="{ uri: navigatorState().previousId | toFullUri }"
            >
              <i class="fa fa-angle-left"></i>
            </a>
          } @else {
            <button class="btn btn-light flex-grow-1 me-1" disabled>
              <i class="fa fa-angle-left"></i>
            </button>
          }
          @if (navigatorState().nextId) {
            <a
              class="btn btn-light flex-grow-1 ms-1"
              [routerLink]="buttonRouterLink()"
              [queryParams]="{ uri: navigatorState().nextId | toFullUri }"
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
  imports: [RouterLink, SpinnerComponent, ToFullUriPipe],
})
export class DocumentNavigatorComponent<
  T extends KotkaDocumentObjectType = KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T] = KotkaDocumentObjectMap[T],
> implements OnDestroy {
  private searchResultIteratorService = inject(SearchResultIteratorService);

  dataType = input.required<T>();
  data = input<S>();
  buttonRouterLink = input.required<string>();

  navigatorState = signal<NavigatorState>({ loading: false });

  private navigatorDataSub?: Subscription;

  constructor() {
    effect(() => {
      const type = this.dataType();
      const doc = this.data();

      if (doc) {
        this.navigatorDataSub?.unsubscribe();

        this.navigatorState.set({ loading: true });

        this.navigatorDataSub = forkJoin([
          this.searchResultIteratorService.getPrevious(type, doc),
          this.searchResultIteratorService.getNext(type, doc),
        ]).subscribe({
          next: ([previousId, nextId]) => {
            this.navigatorState.set({ loading: false, previousId, nextId });
          },
          error: () => {
            this.navigatorState.set({ loading: false });
          },
        });
      }
    });
  }

  ngOnDestroy() {
    this.navigatorDataSub?.unsubscribe();
  }
}


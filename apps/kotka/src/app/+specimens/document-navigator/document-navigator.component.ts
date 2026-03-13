import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core';
import {
  KotkaDocumentObjectMap,
  KotkaDocumentObjectType,
} from '@kotka/shared/models';
import { RouterLink } from '@angular/router';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { ToFullUriPipe } from '@kotka/ui/pipes';
import { forkJoin, Subscription } from 'rxjs';
import { SearchResultIteratorService } from '@kotka/ui/services';

interface NavigatorState {
  loading: boolean;
  previousId?: string;
  nextId?: string;
}

@Component({
  selector: 'kotka-document-navigator',
  templateUrl: './document-navigator.component.html',
  imports: [RouterLink, SpinnerComponent, ToFullUriPipe],
  styleUrls: ['./document-navigator.component.scss'],
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

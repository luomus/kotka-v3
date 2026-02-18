import { Component, inject, input } from '@angular/core';
import {
  botanical,
  fungi,
  insectaDet,
  LabelDesignerComponent,
  SpecimenLabelDesignerService,
  vertebrate,
} from '@kotka/ui/label-designer';
import { globals } from '../../../environments/globals';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '@kotka/ui/services';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { combineLatest, Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ILabelData, ILabelField } from '@luomus/label-designer';

interface LabelDataResult {
  value?: ILabelData[];
  loading: boolean;
}

interface ViewModel {
  fields?: ILabelField[];
  data?: ILabelData[];
  dataLoading: boolean;
}

@Component({
  selector: 'kotka-specimen-label-designer',
  template: `
    @if (vm$ | async; as vm) {
      @if (vm.fields && !vm.dataLoading) {
        <kui-label-designer
          [defaultAvailableFields]="vm.fields"
          [data]="vm.data"
          [setupStorageKey]="setupStorageKey()"
          [templates]="templates"
        />
      } @else {
        <kui-spinner></kui-spinner>
      }
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }
  `,
  imports: [LabelDesignerComponent, SpinnerComponent, AsyncPipe],
  standalone: true,
})
export class SpecimenLabelDesignerComponent {
  private userService = inject(UserService);
  private labelDesignerService = inject(SpecimenLabelDesignerService);

  documents = input<any[]>();

  allFields$: Observable<ILabelField[]>;
  labelData$: Observable<LabelDataResult>;
  vm$: Observable<ViewModel>;

  setupStorageKey = toSignal(
    this.userService
      .getCurrentLoggedInUser()
      .pipe(map((user) => `ld-setup-${user.id}`)),
  );

  templates = [fungi, insectaDet, vertebrate, botanical];

  constructor() {
    this.allFields$ = this.labelDesignerService
      .getAllFields(globals.specimenFormId)
      .pipe(shareReplay(1));

    this.labelData$ = combineLatest([
      this.allFields$,
      toObservable(this.documents),
    ]).pipe(
      switchMap(([fields, docs]) => {
        if (fields && docs) {
          return this.labelDesignerService.getData(fields, docs).pipe(
            map((data) => ({ value: data, loading: false })),
            startWith({ loading: true }),
          );
        }
        return of({ loading: false });
      }),
    );

    this.vm$ = combineLatest([
      this.allFields$,
      this.labelData$,
    ]).pipe(
      map(([fields, data]) => ({
        fields,
        data: data?.value,
        dataLoading: data?.loading,
      })),
      startWith({ dataLoading: false }),
    );
  }
}

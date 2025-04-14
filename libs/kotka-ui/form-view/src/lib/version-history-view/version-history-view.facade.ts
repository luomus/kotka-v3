import { Injectable } from '@angular/core';
import { ApiClient, FormService, startWithUndefined } from '@kotka/ui/services';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {
  KotkaDocumentObject,
  KotkaDocumentObjectType,
  KotkaDocumentObjectMap,
  KotkaVersionDifferenceObject,
  LajiForm,
  StoreVersion,
} from '@kotka/shared/models';
import { getId } from '@kotka/shared/utils';

export enum VersionHistoryErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError',
}

export enum VersionHistoryViewEnum {
  versionList = 'versionList',
  version = 'version',
  versionComparison = 'versionComparison',
}

export interface VersionHistoryInputs<T extends KotkaDocumentObjectType> {
  formId: string;
  dataType: T;
  dataURI?: string;
  version?: number;
  versions?: number[];
  view?: VersionHistoryViewEnum;
}

export interface VersionHistoryState<S extends KotkaDocumentObject> {
  versionList?: StoreVersion[];
  form?: LajiForm.SchemaForm;
  jsonForm?: LajiForm.JsonForm;
  data?: S;
  differenceData?: KotkaVersionDifferenceObject;
}

export interface ErrorViewModel {
  errorType: VersionHistoryErrorEnum;
}

export type ViewModel<S extends KotkaDocumentObject> =
  | VersionHistoryState<S>
  | ErrorViewModel;

export function isSuccessViewModel<S extends KotkaDocumentObject>(
  viewModel: ViewModel<S>,
): viewModel is VersionHistoryState<S> {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel<S extends KotkaDocumentObject>(
  viewModel: ViewModel<S>,
): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}

@Injectable()
export class VersionHistoryViewFacade<
  T extends KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T],
> {
  versionList$: Observable<StoreVersion[] | undefined>;
  form$: Observable<LajiForm.SchemaForm | undefined>;
  jsonForm$: Observable<LajiForm.JsonForm | undefined>;
  data$: Observable<S | undefined>;
  differenceData$: Observable<KotkaVersionDifferenceObject | undefined>;

  vm$: Observable<ViewModel<S>>;

  private inputs$ = new ReplaySubject<VersionHistoryInputs<T>>(1);

  constructor(
    private formService: FormService,
    private apiClient: ApiClient,
  ) {
    this.versionList$ = this.getVersionList$();
    this.form$ = this.getForm$();
    this.jsonForm$ = this.getFormInJsonFormat$();
    this.data$ = this.getData$();
    this.differenceData$ = this.getDifferenceData$();

    this.vm$ = this.getVm$();
  }

  setInputs(inputs: VersionHistoryInputs<T>) {
    this.inputs$.next(inputs);
  }

  private getVm$(): Observable<ViewModel<S>> {
    return this.inputs$.pipe(
      switchMap((inputs: VersionHistoryInputs<T>) => {
        let obs$: Observable<VersionHistoryState<S>>;

        if (inputs.view === VersionHistoryViewEnum.versionList) {
          obs$ = this.versionList$.pipe(
            map((versionList) => ({ versionList })),
          );
        } else if (inputs.view === VersionHistoryViewEnum.version) {
          obs$ = combineLatest([
            this.versionList$,
            this.form$,
            this.data$,
          ]).pipe(
            map(([versionList, form, data]) => ({ versionList, form, data })),
          );
        } else {
          obs$ = combineLatest([
            this.versionList$,
            this.jsonForm$,
            this.differenceData$,
          ]).pipe(
            map(([versionList, jsonForm, differenceData]) => ({
              versionList,
              jsonForm,
              differenceData,
            })),
          );
        }

        return obs$.pipe(
          catchError((err) => {
            const errorType =
              err.message === VersionHistoryErrorEnum.dataNotFound
                ? VersionHistoryErrorEnum.dataNotFound
                : VersionHistoryErrorEnum.genericError;
            return of({ errorType });
          }),
        );
      }),
      shareReplay(1),
    );
  }

  private getVersionList$(): Observable<StoreVersion[] | undefined> {
    return this.inputs$.pipe(
      distinctUntilChanged(
        (inputs1, inputs2) =>
          inputs1.dataURI === inputs2.dataURI &&
          inputs1.dataType === inputs2.dataType,
      ),
      switchMap((inputs) =>
        startWithUndefined(
          this.getVersionListForDocument$(inputs.dataType, inputs.dataURI),
        ),
      ),
      shareReplay(1),
    );
  }

  private getForm$(): Observable<LajiForm.SchemaForm | undefined> {
    return this.inputs$.pipe(
      switchMap((inputs) =>
        startWithUndefined(
          this.formService.getFormWithUserContext(inputs.formId),
        ),
      ),
    );
  }

  private getFormInJsonFormat$(): Observable<LajiForm.JsonForm | undefined> {
    return this.inputs$.pipe(
      switchMap((inputs) =>
        startWithUndefined(this.formService.getFormInJsonFormat(inputs.formId)),
      ),
    );
  }

  private getData$(): Observable<S | undefined> {
    return this.inputs$.pipe(
      switchMap((inputs) =>
        startWithUndefined(
          this.getVersionData$(inputs.dataType, inputs.dataURI, inputs.version),
        ),
      ),
    );
  }

  private getDifferenceData$(): Observable<
    KotkaVersionDifferenceObject<S> | undefined
  > {
    return this.inputs$.pipe(
      switchMap((inputs) =>
        startWithUndefined(
          this.getVersionDifference$(
            inputs.dataType,
            inputs.dataURI,
            inputs.versions,
          ),
        ),
      ),
    );
  }

  private getVersionListForDocument$(
    dataType: T,
    dataURI?: string,
  ): Observable<StoreVersion[]> {
    if (!dataURI) {
      return of([]);
    }

    const id = getId(dataURI);
    return this.apiClient.getDocumentVersionList(dataType, id).pipe(
      catchError((err) => {
        err =
          err.status === 404
            ? new Error(VersionHistoryErrorEnum.dataNotFound)
            : err;
        return throwError(() => err);
      }),
    );
  }

  private getVersionData$(
    dataType: T,
    dataURI?: string,
    version?: number,
  ): Observable<S> {
    if (!dataURI || version === undefined) {
      return throwError(() => new Error(VersionHistoryErrorEnum.dataNotFound));
    }

    const id = getId(dataURI);
    return this.apiClient
      .getDocumentVersionData<T, S>(dataType, id, version)
      .pipe(
        catchError((err) => {
          err =
            err.status === 404
              ? new Error(VersionHistoryErrorEnum.dataNotFound)
              : err;
          return throwError(() => err);
        }),
      );
  }

  private getVersionDifference$(
    dataType: T,
    dataURI?: string,
    versions?: number[],
  ): Observable<KotkaVersionDifferenceObject<S>> {
    if (!dataURI || !versions || versions.length !== 2) {
      return throwError(() => new Error(VersionHistoryErrorEnum.dataNotFound));
    }

    const id = getId(dataURI);
    return this.apiClient.getDocumentVersionDifference(
      dataType,
      id,
      versions[0],
      versions[1],
    );
  }
}

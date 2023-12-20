import { Injectable } from '@angular/core';
import { DataService, FormService } from '@kotka/services';
import {
  catchError,
  combineLatest,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  switchMap,
  throwError
} from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import {
  KotkaDocumentObject,
  KotkaDocumentObjectType,
  KotkaVersionDifferenceObject,
  LajiForm,
  StoreVersion
} from '@kotka/shared/models';
import { FormViewUtils } from '../form-view/form-view-utils';
import { Utils } from '../../../shared/services/utils';

export enum VersionHistoryErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

export enum VersionHistoryViewEnum {
  versionList = 'versionList',
  version = 'version',
  versionComparison = 'versionComparison'
}

export interface VersionHistoryInputs {
  formId: string;
  dataType: KotkaDocumentObjectType;
  dataURI?: string;
  version?: number;
  versions?: number[];
  view?: VersionHistoryViewEnum;
}

export interface VersionHistoryState {
  versionList?: StoreVersion[];
  form?: LajiForm.SchemaForm;
  jsonForm?: LajiForm.JsonForm;
  data?: KotkaDocumentObject;
  differenceData?: KotkaVersionDifferenceObject;
}

export interface ErrorViewModel {
  errorType: VersionHistoryErrorEnum;
}

export type ViewModel = VersionHistoryState | ErrorViewModel;

export function isSuccessViewModel(viewModel: ViewModel): viewModel is VersionHistoryState {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel(viewModel: ViewModel): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}

@Injectable()
export class VersionHistoryViewFacade {
  versionList$: Observable<StoreVersion[]|undefined>;
  form$: Observable<LajiForm.SchemaForm|undefined>;
  jsonForm$: Observable<LajiForm.JsonForm|undefined>;
  data$: Observable<KotkaDocumentObject|undefined>;
  differenceData$: Observable<KotkaVersionDifferenceObject|undefined>;

  vm$: Observable<ViewModel>;

  private inputs$ = new ReplaySubject<VersionHistoryInputs>(1);

  constructor(
    private formService: FormService,
    private dataService: DataService
  ) {
    this.versionList$ = this.getVersionList$();
    this.form$ = this.getForm$();
    this.jsonForm$ = this.getFormInJsonFormat$();
    this.data$ = this.getData$();
    this.differenceData$ = this.getDifferenceData$();

    this.vm$ = this.getVm$();
  }

  setInputs(inputs: VersionHistoryInputs) {
    this.inputs$.next(inputs);
  }

  private getVm$(): Observable<ViewModel> {
    return this.inputs$.pipe(
      switchMap((inputs: VersionHistoryInputs) => {
        let obs$: Observable<VersionHistoryState>;

        if (inputs.view === VersionHistoryViewEnum.versionList) {
          obs$ = this.versionList$.pipe(map(versionList => ({ versionList })));
        } else if (inputs.view === VersionHistoryViewEnum.version) {
          obs$ = combineLatest([this.versionList$, this.form$, this.data$]).pipe(map(([versionList, form, data]) => ({ versionList, form, data })));
        } else {
          obs$ = combineLatest([this.versionList$, this.jsonForm$, this.differenceData$]).pipe(map(([versionList, jsonForm, differenceData]) => ({ versionList, jsonForm, differenceData })));
        }

        return obs$.pipe(
          catchError(err => {
            const errorType = err.message === VersionHistoryErrorEnum.dataNotFound ? VersionHistoryErrorEnum.dataNotFound : VersionHistoryErrorEnum.genericError;
            return of({ errorType });
          })
        );
      }),
      shareReplay(1)
    );
  }

  private getVersionList$(): Observable<StoreVersion[]|undefined> {
    return this.inputs$.pipe(
      distinctUntilChanged((inputs1, inputs2) => (
        inputs1.dataURI === inputs2.dataURI && inputs1.dataType === inputs2.dataType
      )),
      switchMap(inputs => Utils.startWithUndefined(
        this.getVersionListForDocument$(inputs.dataType, inputs.dataURI)
      )),
      shareReplay(1)
    );
  }

  private getForm$(): Observable<LajiForm.SchemaForm|undefined> {
    return this.inputs$.pipe(
      switchMap(inputs => Utils.startWithUndefined(
        this.formService.getFormWithUserContext(inputs.formId)
      ))
    );
  }

  private getFormInJsonFormat$(): Observable<LajiForm.JsonForm|undefined> {
    return this.inputs$.pipe(
      switchMap(inputs => Utils.startWithUndefined(
        this.formService.getFormInJsonFormat(inputs.formId)
      ))
    );
  }

  private getData$(): Observable<KotkaDocumentObject|undefined> {
    return this.inputs$.pipe(
      switchMap(inputs => Utils.startWithUndefined(
        this.getVersionData$(inputs.dataType, inputs.dataURI, inputs.version)
      ))
    );
  }

  private getDifferenceData$(): Observable<KotkaVersionDifferenceObject|undefined> {
    return this.inputs$.pipe(
      switchMap(inputs => Utils.startWithUndefined(
        this.getVersionDifference$(inputs.dataType, inputs.dataURI, inputs.versions)
      ))
    );
  }

  private getVersionListForDocument$(dataType: KotkaDocumentObjectType, dataURI?: string): Observable<StoreVersion[]> {
    if (!dataURI) {
      return of([]);
    }

    const id = FormViewUtils.getIdFromDataURI(dataURI);
    return this.dataService.getVersionList(dataType, id).pipe(
      catchError(err => {
        err = err.status === 404 ? VersionHistoryErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      })
    );
  }

  private getVersionData$(dataType: KotkaDocumentObjectType, dataURI?: string, version?: number): Observable<KotkaDocumentObject> {
    if (!dataURI || version === undefined) {
      return throwError(() => new Error(VersionHistoryErrorEnum.dataNotFound));
    }

    const id = FormViewUtils.getIdFromDataURI(dataURI);
    return this.dataService.getVersionData(dataType, id, version).pipe(
      catchError(err => {
        err = err.status === 404 ? VersionHistoryErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      })
    );
  }

  private getVersionDifference$(dataType: KotkaDocumentObjectType, dataURI?: string, versions?: number[]): Observable<KotkaVersionDifferenceObject> {
    if (!dataURI || !versions || versions.length !== 2) {
      return throwError(() => new Error(VersionHistoryErrorEnum.dataNotFound));
    }

    const id = FormViewUtils.getIdFromDataURI(dataURI);
    return this.dataService.getVersionDifference(dataType, id, versions[0], versions[1]);
  }
}

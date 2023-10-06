import { Injectable } from '@angular/core';
import {
  DataService,
  VersionDifference
} from '../../../shared/services/data.service';
import { FormService } from '../../../shared/services/form.service';
import { UserService } from '../../../shared/services/user.service';
import {
  catchError,
  combineLatest,
  concat,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  switchMap,
  throwError
} from 'rxjs';
import { distinctUntilChanged, filter, map, take } from 'rxjs/operators';
import { LajiForm } from '@kotka/shared/models';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DocumentObject, KotkaDocumentType, StoreVersion } from '@kotka/api-interfaces';
import { FormViewUtils } from '../form-view/form-view-utils';

export enum VersionHistoryErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

export enum VersionHistoryViewEnum {
  versionList = 'versionList',
  version = 'version',
  versionComparison = 'versionComparison'
}

export interface RouteParams {
  dataURI?: string;
  version?: number;
  versions?: number[];
  view?: VersionHistoryViewEnum;
}

export interface VersionHistoryInputs<T extends KotkaDocumentType> {
  formId: string;
  dataType: T;
}

export interface BaseViewModel {
  routeParams: RouteParams;
}

export interface VersionListViewModel extends BaseViewModel {
  versionList?: StoreVersion[];
}
export interface VersionViewModel<T extends KotkaDocumentType> extends BaseViewModel {
  form?: LajiForm.SchemaForm;
  data?: DocumentObject<T>;
  versionList?: StoreVersion[];
}
export interface VersionComparisonViewModel<T extends KotkaDocumentType> extends BaseViewModel {
  form?: LajiForm.JsonForm;
  diffData?: VersionDifference<T>;
  versionList?: StoreVersion[];
}

export type SuccessViewModel<T extends KotkaDocumentType> = VersionListViewModel | VersionViewModel<T> | VersionComparisonViewModel<T>;

export interface ErrorViewModel extends BaseViewModel {
  errorType: VersionHistoryErrorEnum;
}

export type ViewModel<T extends KotkaDocumentType> = SuccessViewModel<T> | ErrorViewModel;

export function isSuccessViewModel<T extends KotkaDocumentType>(viewModel: ViewModel<T>): viewModel is SuccessViewModel<T> {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel<T extends KotkaDocumentType>(viewModel: ViewModel<T>): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}
export function isVersionListViewModel<T extends KotkaDocumentType>(viewModel: SuccessViewModel<T>): viewModel is VersionListViewModel {
  return viewModel?.routeParams.view === VersionHistoryViewEnum.versionList;
}
export function isVersionViewModel<T extends KotkaDocumentType>(viewModel: SuccessViewModel<T>): viewModel is VersionViewModel<T> {
  return viewModel?.routeParams.view === VersionHistoryViewEnum.version;
}
export function isVersionComparisonViewModel<T extends KotkaDocumentType>(viewModel: SuccessViewModel<T>): viewModel is VersionComparisonViewModel<T> {
  return viewModel?.routeParams.view === VersionHistoryViewEnum.versionComparison;
}

@Injectable()
export class VersionHistoryViewFacade<T extends KotkaDocumentType> {
  vm$: Observable<ViewModel<T>>;

  private inputs$ = new ReplaySubject<VersionHistoryInputs<T>>(1);

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private formService: FormService,
    private dataService: DataService
  ) {
    this.vm$ = this.getVm$();
  }

  setInputs(inputs: VersionHistoryInputs<T>) {
    this.inputs$.next(inputs);
  }

  private getVm$(): Observable<ViewModel<T>> {
    const routeParams$ = this.getRouteParams$();
    routeParams$.pipe(take(1)).subscribe(); // TODO refactor so that this is not needed

    const versionList$ = combineLatest([routeParams$, this.inputs$]).pipe(
      distinctUntilChanged(([params1, inputs1], [params2, inputs2]) => (
        params1.dataURI === params2.dataURI && inputs1.dataType === inputs2.dataType
      )),
      switchMap(([params, inputs]) => concat(
        of(undefined), this.getVersionList$(inputs.dataType, params.dataURI))
      ),
      shareReplay(1)
    );

    return combineLatest([routeParams$, this.inputs$]).pipe(
      switchMap(([routeParams, inputs]) => combineLatest([
        versionList$,
        this.getViewData$(routeParams, inputs)
      ]).pipe(
        map(([versionList, viewData]) => {
          const currentVersion = versionList ? versionList[versionList.length - 1].version + '' : undefined;
          if (routeParams.view === VersionHistoryViewEnum.version && routeParams.version === currentVersion) {
            throw new Error(VersionHistoryErrorEnum.genericError);
          }
          return { routeParams, versionList, ...viewData };
        }),
        catchError(err => {
          const errorType = err.message === VersionHistoryErrorEnum.dataNotFound ? VersionHistoryErrorEnum.dataNotFound : VersionHistoryErrorEnum.genericError;
          return of({ routeParams, errorType });
        }))
      ),
      shareReplay(1)
    );
  }

  private getRouteParams$(): Observable<RouteParams> {
    return this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        const dataURI = this.activeRoute.snapshot.queryParams['uri'];
        const versionParam = this.activeRoute.snapshot.queryParams['version'];

        let version, versions;
        if (versionParam) {
          if (Array.isArray(versionParam)) {
            version = undefined;
            versions = versionParam.map(value => parseInt(value, 10)).filter(value => !!value);
          } else {
            version = parseInt(versionParam, 10) || undefined;
            versions = undefined;
          }
        }

        const view = version !== undefined ? VersionHistoryViewEnum.version : (
          versions ? VersionHistoryViewEnum.versionComparison : VersionHistoryViewEnum.versionList
        );

        return { dataURI, version, versions, view };
      }),
      shareReplay(1)
    );
  }

  private getViewData$(params: RouteParams, inputs: VersionHistoryInputs<T>): Observable<Omit<SuccessViewModel<T>, 'routeParams'|'versionList'>> {
    if (!params.dataURI) {
      return throwError(() => new Error(VersionHistoryErrorEnum.dataNotFound));
    }

    if (params.view === VersionHistoryViewEnum.versionList) {
      return of({});
    } else if (params.view === VersionHistoryViewEnum.version) {
      const form$ = concat(of(undefined), this.getForm$(inputs));
      const data$ = concat(of(undefined), this.getVersionData$(inputs.dataType, params.dataURI, params.version));

      return combineLatest([form$, data$]).pipe(map(([form, data]) => ({ form, data })));
    } else {
      const form$ = concat(of(undefined), this.getFormInJsonFormat$(inputs));
      const versionDifference$ = concat(of(undefined), this.getVersionDifference$(inputs.dataType, params.dataURI, params.versions));

      return combineLatest([form$, versionDifference$]).pipe(map(([form, diffData]) => ({ form, diffData })));
    }
  }

  private getForm$(inputs: VersionHistoryInputs<T>): Observable<LajiForm.SchemaForm> {
    return this.formService.getFormWithUserContext(inputs.formId);
  }

  private getFormInJsonFormat$(inputs: VersionHistoryInputs<T>): Observable<LajiForm.JsonForm> {
    return this.formService.getFormInJsonFormat(inputs.formId);
  }

  private getVersionList$(dataType: KotkaDocumentType, dataURI?: string): Observable<StoreVersion[]> {
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

  private getVersionData$(dataType: T, dataURI?: string, version?: number): Observable<DocumentObject<T>> {
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

  private getVersionDifference$(dataType: T, dataURI?: string, versions?: number[]): Observable<VersionDifference<T>> {
    if (!dataURI || !versions || versions.length !== 2) {
      return throwError(() => new Error(VersionHistoryErrorEnum.dataNotFound));
    }

    const id = FormViewUtils.getIdFromDataURI(dataURI);
    return this.dataService.getVersionDifference(dataType, id, versions[0], versions[1]);
  }
}

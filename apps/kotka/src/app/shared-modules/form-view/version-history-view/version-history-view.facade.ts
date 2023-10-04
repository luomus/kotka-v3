import { Injectable } from '@angular/core';
import {
  DataObject,
  DataService,
  DataType,
  VersionDifference
} from '../../../shared/services/api-services/data.service';
import { FormService } from '../../../shared/services/api-services/form.service';
import { UserService } from '../../../shared/services/api-services/user.service';
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
import { filter, map, take } from 'rxjs/operators';
import { LajiForm } from '@kotka/shared/models';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormErrorEnum, FormInputs } from '../form-view/form-view.facade';
import { StoreVersion } from '@kotka/api-interfaces';

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
  version?: string;
  versions?: string[];
  view?: VersionHistoryViewEnum;
}

export interface VersionHistoryInputs {
  formId: string;
  dataType: DataType;
}

export interface BaseViewModel {
  routeParams: RouteParams;
}

export interface VersionListViewModel extends BaseViewModel {
  versionList?: StoreVersion[];
}
export interface VersionViewModel extends BaseViewModel {
  form?: LajiForm.SchemaForm;
  data?: DataObject;
  versionList?: StoreVersion[];
}
export interface VersionComparisonViewModel extends BaseViewModel {
  form?: LajiForm.JsonForm;
  diffData?: VersionDifference;
  versionList?: StoreVersion[];
}

export type SuccessViewModel = VersionListViewModel | VersionViewModel | VersionComparisonViewModel;

export interface ErrorViewModel extends BaseViewModel {
  errorType: VersionHistoryErrorEnum;
}

export type ViewModel = SuccessViewModel | ErrorViewModel;

export function isSuccessViewModel(viewModel: ViewModel): viewModel is SuccessViewModel {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel(viewModel: ViewModel): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}
export function isVersionListViewModel(viewModel: SuccessViewModel): viewModel is VersionListViewModel {
  return viewModel?.routeParams.view === VersionHistoryViewEnum.versionList;
}
export function isVersionViewModel(viewModel: SuccessViewModel): viewModel is VersionViewModel {
  return viewModel?.routeParams.view === VersionHistoryViewEnum.version;
}
export function isVersionComparisonViewModel(viewModel: SuccessViewModel): viewModel is VersionComparisonViewModel {
  return viewModel?.routeParams.view === VersionHistoryViewEnum.versionComparison;
}

@Injectable()
export class VersionHistoryViewFacade {
  vm$: Observable<ViewModel>;

  private inputs$ = new ReplaySubject<VersionHistoryInputs>(1);

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private formService: FormService,
    private dataService: DataService
  ) {
    this.vm$ = this.getVm$();
  }

  setInputs(inputs: VersionHistoryInputs) {
    this.inputs$.next(inputs);
  }

  private getVm$(): Observable<ViewModel> {
    const routeParams$ = this.getRouteParams$();
    routeParams$.pipe(take(1)).subscribe(); // TODO refactor so that this is not needed

    const viewData$ = combineLatest([routeParams$, this.inputs$]).pipe(
      switchMap(([params, inputs]) => concat(
        of(undefined), this.getViewData$(params, inputs)
      ))
    );

    return combineLatest([
      routeParams$, viewData$
    ]).pipe(
      map(([routeParams, viewData]) => {
        return { routeParams, ...viewData };
      }),
      catchError(err => {
        const errorType = err.message === VersionHistoryErrorEnum.dataNotFound ? VersionHistoryErrorEnum.dataNotFound : VersionHistoryErrorEnum.genericError;
        return routeParams$.pipe(
          map(routeParams => ({ routeParams, errorType }))
        );
      }),
      shareReplay(1)
    );
  }

  private getRouteParams$(): Observable<RouteParams> {
    return this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => {
        const dataURI = this.activeRoute.snapshot.queryParams['uri'];
        let version = this.activeRoute.snapshot.queryParams['version'];
        let versions = undefined;

        if (Array.isArray(version)) {
          versions = version;
          version = undefined;
        }

        const view = version ? VersionHistoryViewEnum.version : (
          versions ? VersionHistoryViewEnum.versionComparison : VersionHistoryViewEnum.versionList
        );

        return { dataURI, version, versions, view };
      }),
      shareReplay(1)
    );
  }

  private getViewData$(params: RouteParams, inputs: VersionHistoryInputs): Observable<Omit<SuccessViewModel, 'routeParams'>> {
    if (!params.dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const versionList$ = this.getVersionList$(inputs.dataType, params.dataURI);

    if (params.view === VersionHistoryViewEnum.versionList) {
      return versionList$.pipe(map(versionList => ({ versionList })));
    } else if (params.view === VersionHistoryViewEnum.version) {
      const form$ = this.getForm$(inputs);
      const data$ = this.getVersionData$(inputs.dataType, params.dataURI, params.version);
      return combineLatest([form$, data$, versionList$]).pipe(map(([form, data, versionList]) => ({ form, data, versionList })));
    } else {
      const form$ = this.getFormInJsonFormat$(inputs);
      const versionDifference$ = this.getVersionDifference$(inputs.dataType, params.dataURI, params.versions);
      return combineLatest([form$, versionDifference$, versionList$]).pipe(map(([form, diffData, versionList]) => ({ form, diffData, versionList })));
    }
  }

  private getForm$(inputs: FormInputs): Observable<LajiForm.SchemaForm> {
    return this.formService.getFormWithUserContext(inputs.formId);
  }

  private getFormInJsonFormat$(inputs: VersionHistoryInputs): Observable<LajiForm.JsonForm> {
    return this.formService.getFormInJsonFormat(inputs.formId);
  }

  private getVersionList$(dataType: DataType, dataURI?: string): Observable<StoreVersion[]> {
    if (!dataURI) {
      return of([]);
    }
    const uriParts = dataURI.split('/');
    const id = uriParts.pop() as string;
    return this.dataService.getVersionList(dataType, id).pipe(
      catchError(err => {
        err = err.status === 404 ? FormErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      })
    );
  }

  private getVersionData$(dataType: DataType, dataURI?: string, version?: string): Observable<DataObject> {
    if (!dataURI || !version) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const id: string = dataURI.split('/').pop() as string;
    return this.dataService.getVersionData(dataType, id, version).pipe(
      catchError(err => {
        err = err.status === 404 ? FormErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      })
    );
  }

  private getVersionDifference$(dataType: DataType, dataURI?: string, versions?: string[]): Observable<VersionDifference> {
    if (!dataURI || !versions || versions.length !== 2) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const id: string = dataURI.split('/').pop() as string;
    return this.dataService.getVersionDifference(dataType, id, versions[0], versions[1]);
  }
}

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

export interface RouteParams {
  dataURI?: string;
  version?: string|string[];
}

export interface VersionHistoryInputs {
  formId: string;
  dataType: DataType;
}

interface VersionListViewData {
  type: 'versionList';
  data: StoreVersion[];
}
interface VersionViewData {
  type: 'version';
  form: LajiForm.SchemaForm;
  data: DataObject;
}
interface VersionComparisonViewData {
  type: 'comparison';
  form: LajiForm.JsonForm;
  data: VersionDifference;
}

export type ViewData = VersionListViewData | VersionViewData | VersionComparisonViewData;

export function isVersionListViewData(viewData: ViewData): viewData is VersionListViewData {
  return viewData?.type === 'versionList';
}
export function isVersionViewData(viewData: ViewData): viewData is VersionViewData {
  return viewData?.type === 'version';
}
export function isVersionComparisonViewData(viewData: ViewData): viewData is VersionComparisonViewData {
  return viewData?.type === 'comparison';
}

export interface SuccessViewModel {
  routeParams: RouteParams;
  viewData?: ViewData;
}
export interface ErrorViewModel {
  routeParams: RouteParams;
  errorType: VersionHistoryErrorEnum;
}

export type ViewModel = SuccessViewModel | ErrorViewModel;

export function isSuccessViewModel(viewModel: ViewModel): viewModel is SuccessViewModel {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel(viewModel: ViewModel): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
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
        return { routeParams, viewData };
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
        const version = this.activeRoute.snapshot.queryParams['version'];
        return { dataURI, version };
      }),
      shareReplay(1)
    );
  }

  private getViewData$(params: RouteParams, inputs: VersionHistoryInputs): Observable<ViewData> {
    if (!params.dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    if (!params.version) {
      return this.getVersionList$(inputs.dataType, params.dataURI).pipe(map(data => ({ type: 'versionList', data })));
    } else if (!Array.isArray(params.version)) {
      const form$ = this.getForm$(inputs);
      const data$ = this.getVersionData$(inputs.dataType, params.dataURI, params.version);
      return combineLatest([form$, data$]).pipe(map(([form, data]) => ({ type: 'version', form, data })));
    } else {
      const form$ = this.getFormInJsonFormat$(inputs);
      const versionDifference$ = this.getVersionDifference$(inputs.dataType, params.dataURI, params.version);
      return combineLatest([form$, versionDifference$]).pipe(map(([form, data]) => ({ type: 'comparison', form, data })));
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

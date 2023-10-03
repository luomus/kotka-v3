import { Injectable } from '@angular/core';
import {
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
import { FormErrorEnum } from '../form-view/form-view.facade';
import { StoreVersion } from '@kotka/api-interfaces';

export enum VersionHistoryErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

export interface RouteParams {
  dataURI?: string;
  versions?: string[];
}

export interface VersionHistoryInputs {
  formId: string;
  dataType: DataType;
}

interface VersionListViewData {
  type: 'versionList';
  data: StoreVersion[];
}
interface VersionComparisonViewData {
  type: 'comparison';
  form: LajiForm.JsonForm;
  data: VersionDifference;
}

export type ViewData = VersionListViewData | VersionComparisonViewData;

export function isVersionListViewData(viewData: ViewData): viewData is VersionListViewData {
  return viewData?.type === 'versionList';
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
        const versions = this.activeRoute.snapshot.queryParams['version'];
        return { dataURI, versions };
      }),
      shareReplay(1)
    );
  }

  private getViewData$(params: RouteParams, inputs: VersionHistoryInputs): Observable<ViewData> {
    if (!params.dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    if (!params.versions) {
      return this.getVersionHistory$(inputs.dataType, params.dataURI).pipe(map(data => ({ type: 'versionList', data })));
    } else {
      const form$ = this.getForm$(inputs);
      const versionDifference$ = this.getVersionDifference$(inputs.dataType, params.dataURI, params.versions);
      return combineLatest([form$, versionDifference$]).pipe(map(([form, data]) => ({ type: 'comparison', form, data })));
    }
  }

  private getForm$(inputs: VersionHistoryInputs): Observable<LajiForm.JsonForm> {
    return this.formService.getFormInJsonFormat(inputs.formId);
  }

  private getVersionHistory$(dataType: DataType, dataURI?: string): Observable<StoreVersion[]> {
    if (!dataURI) {
      return of([]);
    }
    const uriParts = dataURI.split('/');
    const id = uriParts.pop() as string;
    return this.dataService.getVersionsById(dataType, id).pipe(
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

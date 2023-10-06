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
import { KotkaDocumentObject, LajiForm } from '@kotka/shared/models';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormErrorEnum, FormInputs } from '../form-view/form-view.facade';
import { DocumentObject, KotkaDocumentType, StoreVersion } from '@kotka/api-interfaces';

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
  dataType: KotkaDocumentType;
}

export interface BaseViewModel {
  routeParams: RouteParams;
}

export interface VersionListViewModel extends BaseViewModel {
  versionList?: StoreVersion[];
}
export interface VersionViewModel extends BaseViewModel {
  form?: LajiForm.SchemaForm;
  data?: KotkaDocumentObject;
  versionList?: StoreVersion[];
}
export interface VersionComparisonViewModel extends BaseViewModel {
  form?: LajiForm.JsonForm;
  diffData?: VersionDifference<any>;
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

  private getViewData$(params: RouteParams, inputs: VersionHistoryInputs): Observable<Omit<SuccessViewModel, 'routeParams'|'versionList'>> {
    if (!params.dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
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

  private getForm$(inputs: FormInputs): Observable<LajiForm.SchemaForm> {
    return this.formService.getFormWithUserContext(inputs.formId);
  }

  private getFormInJsonFormat$(inputs: VersionHistoryInputs): Observable<LajiForm.JsonForm> {
    return this.formService.getFormInJsonFormat(inputs.formId);
  }

  private getVersionList$(dataType: KotkaDocumentType, dataURI?: string): Observable<StoreVersion[]> {
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

  private getVersionData$<T extends KotkaDocumentType>(dataType: T, dataURI?: string, version?: string): Observable<DocumentObject<T>> {
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

  private getVersionDifference$<T extends KotkaDocumentType>(dataType: T, dataURI?: string, versions?: string[]): Observable<VersionDifference<T>> {
    if (!dataURI || !versions || versions.length !== 2) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const id: string = dataURI.split('/').pop() as string;
    return this.dataService.getVersionDifference(dataType, id, versions[0], versions[1]);
  }
}

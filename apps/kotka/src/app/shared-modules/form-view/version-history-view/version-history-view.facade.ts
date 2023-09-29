import { Injectable } from '@angular/core';
import { DataService, DataType } from '../../../shared/services/api-services/data.service';
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
import { StoreVersionDifference } from '@kotka/api-interfaces';
import { FormErrorEnum } from '../form-view/form-view.facade';

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

export interface SuccessViewModel {
  routeParams: RouteParams;
  form?: LajiForm.JsonForm;
  data?: StoreVersionDifference;
}

export interface ErrorViewModel {
  routeParams: RouteParams;
  errorType: VersionHistoryErrorEnum;
}

export type ViewModel = SuccessViewModel | ErrorViewModel;

export function isSuccessViewModel(any: ViewModel): any is SuccessViewModel {
  return !isErrorViewModel(any);
}
export function isErrorViewModel(any: ViewModel): any is ErrorViewModel {
  return 'errorType' in any;
}
export function asErrorViewModel(any: ViewModel): ErrorViewModel {
  return any as ErrorViewModel;
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

    const form$: Observable<LajiForm.JsonForm|undefined> = this.inputs$.pipe(
      switchMap((inputs) => concat(of(undefined), this.getForm$(inputs)))
    );

    const data$: Observable<StoreVersionDifference|undefined> = combineLatest([routeParams$, this.inputs$]).pipe(
      switchMap(([params, inputs]) => concat(
        of(undefined), this.getVersionDifference$(inputs.dataType, params.dataURI, params.versions)
      ))
    );

    return combineLatest([
      routeParams$, form$, data$
    ]).pipe(
      map(([routeParams, form, data]) => {
        return { routeParams, form, data };
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

  private getForm$(inputs: VersionHistoryInputs): Observable<LajiForm.JsonForm> {
    return this.formService.getFormInJsonFormat(inputs.formId);
  }

  private getVersionDifference$(dataType: DataType, dataURI?: string, versions?: string[]): Observable<StoreVersionDifference> {
    if (!dataURI || !versions || versions.length !== 2) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const id: string = dataURI.split('/').pop() as string;
    return this.dataService.getVersionDifference(dataType, id, versions[0], versions[1]);
  }
}

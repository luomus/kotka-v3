import { Injectable, OnDestroy } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
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
  Subscription,
  switchMap,
  throwError
} from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { allowAccessByOrganization, allowAccessByTime } from '@kotka/utils';
import { LajiForm, Person } from '@kotka/shared/models';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { KotkaObject, KotkaObjectType } from '@kotka/api-interfaces';
import { FormViewUtils } from './form-view-utils';

export enum FormErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

export interface RouteParams {
  editMode: boolean;
  dataURI?: string;
}

export interface FormInputs<T extends KotkaObjectType> {
  formId: string;
  dataType: T;
  augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
}

export interface FormState {
  disabled: boolean;
  showDeleteButton: boolean;
  showCopyButton: boolean;
}

export interface SuccessViewModel<T extends KotkaObjectType> {
  routeParams: RouteParams;
  form?: LajiForm.SchemaForm;
  formData?: Partial<KotkaObject<T>>;
  state?: FormState;
}

export interface ErrorViewModel {
  routeParams: RouteParams;
  errorType: FormErrorEnum;
}

export type ViewModel<T extends KotkaObjectType> = SuccessViewModel<T> | ErrorViewModel;

export function isSuccessViewModel<T extends KotkaObjectType>(viewModel: ViewModel<T>): viewModel is SuccessViewModel<T> {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel<T extends KotkaObjectType>(viewModel: ViewModel<T>): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}

@Injectable()
export class FormViewFacade<T extends KotkaObjectType> implements OnDestroy {
  vm$: Observable<ViewModel<T>>;

  private inputs$ = new ReplaySubject<FormInputs<T>>(1);
  private formData$ = new ReplaySubject<Partial<KotkaObject<T>>|undefined>(1);

  private initialFormDataSub?: Subscription;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private formService: FormService,
    private dataService: DataService
  ) {
    this.vm$ = this.getVm$();
  }

  ngOnDestroy() {
    this.initialFormDataSub?.unsubscribe();
  }

  setInputs(inputs: FormInputs<T>) {
    this.inputs$.next(inputs);
  }

  setFormData(formData: Partial<KotkaObject<T>>) {
    this.formData$.next(formData);
  }

  setInitialFormData(formData: Partial<KotkaObject<T>>) {
    this.getEmptyFormData$().pipe(take(1)).subscribe(emptyFormData => {
      this.formData$.next({ ...emptyFormData, ...formData });
    });
  }

  private getVm$(): Observable<ViewModel<T>> {
    const routeParams$ = this.getRouteParams$();
    const user$ = this.getUser$();
    const form$: Observable<LajiForm.SchemaForm|undefined> = this.inputs$.pipe(
      switchMap((inputs) => concat(of(undefined), this.getForm$(inputs))),
      shareReplay(1)
    );

    this.initialFormDataSub = combineLatest([routeParams$, this.inputs$]).pipe(
      switchMap(([params, inputs]) => concat(
        of(undefined), this.getInitialFormData$(params, inputs)
      ))
    ).subscribe({
      'next': formData => this.formData$.next(formData),
      'error': err => this.formData$.error(err)
    });

    const state$: Observable<FormState|undefined> = combineLatest([
      routeParams$, form$, this.formData$, user$
    ]).pipe(map(([routeParams, form, formData, user]) => (
        form && formData ? this.getFormState(routeParams, form, formData, user) : undefined
      )
    ));

    return routeParams$.pipe(
      switchMap(routeParams => combineLatest([
        form$, this.formData$, state$
      ]).pipe(
        map(([form, formData, state]) => {
          return { routeParams, form, formData, state };
        }),
        catchError(err => {
          const errorType = err.message === FormErrorEnum.dataNotFound ? FormErrorEnum.dataNotFound : FormErrorEnum.genericError;
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
        const editMode = this.activeRoute.snapshot.url[0].path === 'edit';
        const dataURI = this.activeRoute.snapshot.queryParams['uri'];
        return { editMode, dataURI };
      }),
      shareReplay(1)
    );
  }

  private getUser$(): Observable<Person> {
    return this.userService.user$.pipe(map(user => {
      if (!user) {
        throw new Error('Missing user information!');
      }
      return user;
    }));
  }

  private getForm$(inputs: FormInputs<T>): Observable<LajiForm.SchemaForm> {
    return this.formService.getFormWithUserContext(inputs.formId).pipe(
      switchMap(form => inputs.augmentFormFunc ? inputs.augmentFormFunc(form) : of(form))
    );
  }

  private getInitialFormData$(routeParams: RouteParams, inputs: FormInputs<T>): Observable<Partial<KotkaObject<T>>> {
    if (routeParams.editMode) {
      return this.getFormData$(inputs.dataType, routeParams.dataURI);
    } else {
      return this.getEmptyFormData$();
    }
  }

  private getEmptyFormData$(): Observable<Partial<KotkaObject<T>>> {
    return this.getUser$().pipe(map(user => {
      const formData: Partial<KotkaObject<T>> = {};
      if (user?.organisation && user.organisation.length === 1) {
        formData.owner = user.organisation[0];
      }
      return formData;
    }));
  }

  private getFormData$(dataType: T, dataURI?: string): Observable<Partial<KotkaObject<T>>> {
    if (!dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }

    const id = FormViewUtils.getIdFromDataURI(dataURI);
    return this.dataService.getById(dataType, id).pipe(
      catchError(err => {
        err = err.status === 404 ? FormErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      })
    );
  }

  private getFormState(routeParams: RouteParams, form: LajiForm.SchemaForm, formData: Partial<KotkaObject<T>>, user: Person): FormState {
    const isAdmin = this.userService.isICTAdmin(user);
    const isEditMode =  routeParams.editMode;
    const disabled = isEditMode && !isAdmin && !allowAccessByOrganization(formData, user);
    const showDeleteButton = isEditMode && (isAdmin || (!disabled && allowAccessByTime(formData, {'d': 14})));
    const showCopyButton = isEditMode && !!form.options?.allowTemplate;

    return { disabled, showDeleteButton, showCopyButton };
  }
}

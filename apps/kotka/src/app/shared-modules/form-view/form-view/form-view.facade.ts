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
import { filter, map } from 'rxjs/operators';
import { allowAccessByOrganization, allowAccessByTime } from '@kotka/utils';
import { LajiForm, Person } from '@kotka/shared/models';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DocumentObject, KotkaDocumentType, StoreVersion } from '@kotka/api-interfaces';
import { FormViewUtils } from './form-view-utils';

export enum FormErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

export interface RouteParams {
  editMode: boolean;
  dataURI?: string;
}

export interface FormInputs<T extends KotkaDocumentType> {
  formId: string;
  dataType: T;
  augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
  getInitialFormDataFunc?: (user: Person) => Partial<DocumentObject<T>>;
}

export interface FormState {
  disabled: boolean;
  showDeleteButton: boolean;
  showCopyButton: boolean;
}

export interface SuccessViewModel<T extends KotkaDocumentType> {
  routeParams: RouteParams;
  form?: LajiForm.SchemaForm;
  formData?: Partial<DocumentObject<T>>;
  state?: FormState;
  versionHistory?: StoreVersion[];
}

export interface ErrorViewModel {
  routeParams: RouteParams;
  errorType: FormErrorEnum;
}

export type ViewModel<T extends KotkaDocumentType> = SuccessViewModel<T> | ErrorViewModel;

export function isSuccessViewModel<T extends KotkaDocumentType>(viewModel: ViewModel<T>): viewModel is SuccessViewModel<T> {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel<T extends KotkaDocumentType>(viewModel: ViewModel<T>): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}

@Injectable()
export class FormViewFacade<T extends KotkaDocumentType> implements OnDestroy {
  vm$: Observable<ViewModel<T>>;

  private inputs$ = new ReplaySubject<FormInputs<T>>(1);
  private formData$ = new ReplaySubject<Partial<DocumentObject<T>>|undefined>(1);

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

  setFormData(formData: Partial<DocumentObject<T>>) {
    this.formData$.next(formData);
  }

  private getVm$(): Observable<ViewModel<T>> {
    const routeParams$ = this.getRouteParams$();
    const user$ = this.getUser$();
    const form$: Observable<LajiForm.SchemaForm|undefined> = this.inputs$.pipe(
      switchMap((inputs) => concat(of(undefined), this.getForm$(inputs))),
      shareReplay(1)
    );

    this.initialFormDataSub = combineLatest([routeParams$, this.inputs$, user$]).pipe(
      switchMap(([params, inputs, user]) => concat(
        of(undefined), this.getInitialFormData$(params, inputs, user)
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

  private getInitialFormData$(routeParams: RouteParams, inputs: FormInputs<T>, user: Person): Observable<Partial<DocumentObject<T>>> {
    if (routeParams.editMode) {
      return this.getFormData$(inputs.dataType, routeParams.dataURI);
    } else {
      return of(inputs.getInitialFormDataFunc?.(user as Person) || {});
    }
  }

  private getFormData$(dataType: T, dataURI?: string): Observable<Partial<DocumentObject<T>>> {
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

  private getFormState(routeParams: RouteParams, form: LajiForm.SchemaForm, formData: Partial<DocumentObject<T>>, user: Person): FormState {
    const isAdmin = this.userService.isICTAdmin(user);
    const isEditMode =  routeParams.editMode;
    const disabled = isEditMode && !isAdmin && !allowAccessByOrganization(formData, user);
    const showDeleteButton = isEditMode && (isAdmin || (!disabled && allowAccessByTime(formData, {'d': 14})));
    const showCopyButton = isEditMode && !!form.options?.allowTemplate;

    return { disabled, showDeleteButton, showCopyButton };
  }
}

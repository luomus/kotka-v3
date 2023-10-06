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
import { KotkaDocumentObject, LajiForm, Person } from '@kotka/shared/models';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DocumentObject, KotkaDocumentType, StoreVersion } from '@kotka/api-interfaces';

export enum FormErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

export interface RouteParams {
  editMode: boolean;
  dataURI?: string;
}

export interface FormInputs {
  formId: string;
  dataType: KotkaDocumentType;
  augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
  getInitialFormDataFunc?: (user: Person) => Partial<KotkaDocumentObject>;
}

export interface FormState {
  disabled: boolean;
  showDeleteButton: boolean;
  showCopyButton: boolean;
}

export interface SuccessViewModel {
  routeParams: RouteParams;
  form?: LajiForm.SchemaForm;
  formData?: Partial<KotkaDocumentObject>;
  state?: FormState;
  versionHistory?: StoreVersion[];
}

export interface ErrorViewModel {
  routeParams: RouteParams;
  errorType: FormErrorEnum;
}

export type ViewModel = SuccessViewModel | ErrorViewModel;

export function isSuccessViewModel(viewModel: ViewModel): viewModel is SuccessViewModel {
  return !isErrorViewModel(viewModel);
}
export function isErrorViewModel(viewModel: ViewModel): viewModel is ErrorViewModel {
  return 'errorType' in viewModel;
}

@Injectable()
export class FormViewFacade implements OnDestroy {
  vm$: Observable<ViewModel>;

  private inputs$ = new ReplaySubject<FormInputs>(1);
  private formData$ = new ReplaySubject<Partial<KotkaDocumentObject>|undefined>(1);

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

  setInputs(inputs: FormInputs) {
    this.inputs$.next(inputs);
  }

  setFormData(formData: Partial<KotkaDocumentObject>) {
    this.formData$.next(formData);
  }

  private getVm$(): Observable<ViewModel> {
    const routeParams$ = this.getRouteParams$();
    const user$ = this.getUser$();
    const form$: Observable<LajiForm.SchemaForm|undefined> = this.inputs$.pipe(
      switchMap((inputs) => concat(of(undefined), this.getForm$(inputs)))
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

    return combineLatest([
      routeParams$, form$, this.formData$, state$
    ]).pipe(
      map(([routeParams, form, formData, state]) => {
        return { routeParams, form, formData, state };
      }),
      catchError(err => {
        const errorType = err.message === FormErrorEnum.dataNotFound ? FormErrorEnum.dataNotFound : FormErrorEnum.genericError;
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

  private getForm$(inputs: FormInputs): Observable<LajiForm.SchemaForm> {
    return this.formService.getFormWithUserContext(inputs.formId).pipe(
      switchMap(form => inputs.augmentFormFunc ? inputs.augmentFormFunc(form) : of(form))
    );
  }

  private getInitialFormData$(routeParams: RouteParams, inputs: FormInputs, user: Person): Observable<Partial<KotkaDocumentObject>> {
    if (routeParams.editMode) {
      return this.getFormData$(inputs.dataType, routeParams.dataURI);
    } else {
      return of(inputs.getInitialFormDataFunc?.(user as Person) || {});
    }
  }

  private getFormData$<T extends KotkaDocumentType>(dataType: T, dataURI?: string): Observable<Partial<DocumentObject<T>>> {
    if (!dataURI) {
      return throwError(() => new Error(FormErrorEnum.dataNotFound));
    }
    const uriParts = dataURI.split('/');
    const id = uriParts.pop() as string;
    return this.dataService.getById(dataType, id).pipe(
      catchError(err => {
        err = err.status === 404 ? FormErrorEnum.dataNotFound : err;
        return throwError(() => new Error(err));
      })
    );
  }

  private getFormState(routeParams: RouteParams, form: LajiForm.SchemaForm, formData: Partial<KotkaDocumentObject>, user: Person): FormState {
    const isAdmin = this.userService.isICTAdmin(user);
    const isEditMode =  routeParams.editMode;
    const disabled = isEditMode && !isAdmin && !allowAccessByOrganization(formData as KotkaDocumentObject, user);
    const showDeleteButton = isEditMode && (isAdmin || (!disabled && allowAccessByTime(formData as KotkaDocumentObject, {'d': 14})));
    const showCopyButton = isEditMode && !!form.options?.allowTemplate;

    return { disabled, showDeleteButton, showCopyButton };
  }
}

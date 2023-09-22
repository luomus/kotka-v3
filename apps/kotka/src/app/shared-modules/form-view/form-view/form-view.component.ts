import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  ContentChild,
  TemplateRef,
  SimpleChanges,
  EventEmitter,
  Output,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../shared/services/api-services/form.service';
import { LajiForm, Person } from '@kotka/shared/models';
import {
  catchError,
  combineLatest,
  from,
  Observable,
  of,
  ReplaySubject,
  Subscription,
  switchMap,
  throwError
} from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataObject, DataService, DataType } from '../../../shared/services/api-services/data.service';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../shared/services/api-services/user.service';
import { FormApiClient } from '../../../shared/services/api-services/form-api-client';
import { allowAccessByOrganization, allowAccessByTime } from '@kotka/utils';
import { DialogService } from '../../../shared/services/dialog.service';
import { ErrorMessages } from '@kotka/api-interfaces';

enum FormErrorEnum {
  dataNotFound = 'dataNotFound',
  genericError = 'genericError'
}

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormViewComponent implements OnChanges, OnDestroy {
  @Input() formId?: string;
  @Input() dataType?: DataType;
  @Input() dataTypeName?: string;
  @Input() augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
  @Input() getInitialFormDataFunc?: (user: Person) => Partial<DataObject>;
  @Input() domain = 'http://tun.fi/';

  visibleDataTypeName?: string;

  routeParams$: Observable<{editMode: boolean, dataURI?: string}>;
  formParams$: Observable<{
    form: LajiForm.SchemaForm,
    formData?: Partial<DataObject>,
    disabled: boolean,
    showDeleteButton: boolean,
    errorType?: undefined
  } | {
    form?: undefined,
    formData?: undefined,
    disabled?: undefined,
    showDeleteButton?: undefined,
    errorType: FormErrorEnum
  }>;

  showDeleteTargetInUseAlert = false;
  showDisabledAlert = false;

  formErrorEnum = FormErrorEnum;

  @Output() formDataChange = new EventEmitter<Partial<DataObject>>();
  @Output() formReady = new EventEmitter<void>();

  private formData$ = new ReplaySubject<Partial<DataObject>>();
  private inputs$ = new ReplaySubject<{formId: string, dataType: DataType}>();

  private formDataFromParamsSub: Subscription;

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;
  @ContentChild('headerTpl', {static: true}) formHeader?: TemplateRef<Element>;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private formService: FormService,
    private dataService: DataService,
    private userService: UserService,
    private dialogService: DialogService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.routeParams$ = combineLatest([
      this.activeRoute.url.pipe(
        map(url => url[0].path === 'edit')
      ),
      this.activeRoute.queryParams.pipe(
        map(queryParams => queryParams['uri'])
      )
    ]).pipe(
      map(([editMode, dataURI]) => ({editMode, dataURI}))
    );

    const user$ = this.userService.user$.pipe(map(user => {
      if (!user) {
        throw new Error('Missing user information!');
      }
      return user;
    }));

    const form$ = this.inputs$.pipe(
      switchMap((inputs) => this.formService.getFormWithUserContext(inputs.formId)),
      switchMap(form => this.augmentFormFunc ? this.augmentFormFunc(form) : of(form))
    );

    this.formDataFromParamsSub = combineLatest([this.routeParams$, this.inputs$, user$]).pipe(
      switchMap(([params, inputs, user]) => {
        if (params.editMode) {
          return this.getFormData(inputs.dataType, params.dataURI);
        } else if (this.getInitialFormDataFunc) {
          return of(this.getInitialFormDataFunc(user));
        } else {
          return of({});
        }
      })
    ).subscribe(formData => this.formData$.next(formData));

    this.formParams$ = combineLatest([this.routeParams$, form$, this.formData$, user$]).pipe(
      map(([routeParams, form, formData, user]) => {
        const isAdmin = this.userService.isICTAdmin(user);
        const isEditMode =  routeParams.editMode;
        const disabled = isEditMode && !isAdmin && !allowAccessByOrganization(formData as DataObject, user);
        const showDeleteButton = isEditMode && (isAdmin || (!disabled && allowAccessByTime(formData as DataObject, {'d': 14})));
        return { form, formData, disabled, showDeleteButton };
      }),
      tap(params => {
        this.showDisabledAlert = params.disabled;
      }),
      catchError(err => {
        const errorType = err.message === FormErrorEnum.dataNotFound ? FormErrorEnum.dataNotFound : FormErrorEnum.genericError;
        return of({ errorType });
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['dataType']) {
      if (this.formId && this.dataType) {
        this.inputs$.next({formId: this.formId, dataType: this.dataType});
      }
    }
    this.visibleDataTypeName = this.dataTypeName || this.dataType;
  }

  ngOnDestroy() {
    this.formDataFromParamsSub.unsubscribe();
  }

  onSubmit(data: DataObject) {
    if (!this.dataType) {
      return;
    }

    let saveData$: Observable<DataObject>;
    if (data.id) {
      saveData$ = this.dataService.update(this.dataType, data.id, data);
    } else {
      saveData$ = this.dataService.create(this.dataType, data);
    }

    this.lajiForm?.block();
    saveData$.subscribe({
      'next': formData => {
        from(this.router.navigate(['..', 'edit'], {
          relativeTo: this.activeRoute,
          queryParams: {uri: this.domain + formData.id}
        })).subscribe(() => {
          this.lajiForm?.unBlock();
          this.notifier.showSuccess('Save success!');
          this.cdr.markForCheck();
        });
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      }
    });
  }

  onFormReady() {
    this.formReady.emit();
  }

  onChange(data: Partial<DataObject>) {
    this.formDataChange.emit(data);
  }

  onDelete(data: DataObject) {
    this.dialogService.confirm(`Are you sure you want to delete this ${this.visibleDataTypeName}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  setFormData(data: Partial<DataObject>) {
    this.formData$.next(data);
  }

  private delete(data: DataObject) {
    if (!this.dataType || !data.id) {
      return;
    }

    this.lajiForm?.block();
    this.dataService.delete(this.dataType, data.id).subscribe({
      'next': () => {
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Success!');
        this.navigateAway();
      },
      'error': err => {
        this.lajiForm?.unBlock();

        if (err?.error?.message === ErrorMessages.deletionTargetInUse) {
          this.showDeleteTargetInUseAlert = true;
        } else {
          this.notifier.showError('Delete failed!');
        }

        this.cdr.markForCheck();
      }
    });
  }

  private navigateAway() {
    this.router.navigate(['..'], {relativeTo: this.activeRoute});
  }

  private getFormData(dataType: DataType, dataURI?: string): Observable<Partial<DataObject>> {
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
}

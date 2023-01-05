import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  ContentChild,
  TemplateRef,
  SimpleChanges
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../shared/services/form.service';
import { LajiForm, Person } from '@kotka/shared/models';
import { combineLatest, from, Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataObject, ApiService, DataType } from '../../../shared/services/api.service';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../shared/services/user.service';
import { FormApiClient } from '../../../shared/services/form-api-client';
import { allowAccessByOrganization, allowAccessByTime } from '@kotka/utils';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormViewComponent {
  @Input() formId?: string;
  @Input() dataType?: DataType;
  @Input() dataTypeName?: string;
  @Input() getInitialFormDataFunc?: (user: Person) => Partial<DataObject>;
  @Input() domain = 'http://tun.fi/';

  inputs$: ReplaySubject<{formId: string, dataType: DataType}> = new ReplaySubject<{formId: string, dataType: DataType}>();
  routeParams$: Observable<{editMode: boolean, dataURI?: string}>;
  formParams$: Observable<{
    form: LajiForm.SchemaForm,
    formData?: Partial<DataObject>,
    disabled: boolean,
    showDeleteButton: boolean
  }>;

  disabledAlertIsDismissed = false;

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;
  @ContentChild('headerTpl', {static: true}) formHeader?: TemplateRef<Element>;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private formService: FormService,
    private apiService: ApiService,
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

    const form$ = this.inputs$.pipe(
      switchMap(inputs => this.formService.getForm(inputs.formId))
    );

    const formData$ = combineLatest([this.routeParams$, this.inputs$]).pipe(
      switchMap(([params, inputs]) => {
        if (params.dataURI) {
          const uriParts = params.dataURI.split('/');
          const id = uriParts.pop() as string;
          return this.apiService.getById(inputs.dataType, id);
        } else {
          return of(undefined);
        }
      })
    );

    this.formParams$ = combineLatest([form$, formData$, this.userService.user$]).pipe(
      map(([form, data, user]) => {
        if (!user) {
          throw new Error('Missing user information');
        }

        const isAdmin = this.userService.isICTAdmin(user);
        const isEditMode = !!data;
        const disabled = isEditMode && !isAdmin && !allowAccessByOrganization(data, user);
        const showDeleteButton = isEditMode && (isAdmin || (!disabled && allowAccessByTime(data, {'d': 14})));

        form.uiSchemaContext = {
          userName: this.userService.formatUserName(user?.fullName),
          ...form.uiSchemaContext
        };

        let formData: Partial<DataObject>|undefined = data;
        if (!formData && this.getInitialFormDataFunc) {
          formData = this.getInitialFormDataFunc(user);
        }

        return {form, formData, disabled, showDeleteButton};
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['dataType']) {
      if (this.formId && this.dataType) {
        this.inputs$.next({formId: this.formId, dataType: this.dataType});
      }
    }
  }

  onSubmit(data: DataObject) {
    if (!this.dataType) {
      return;
    }

    let saveData$: Observable<DataObject>;
    if (data.id) {
      saveData$ = this.apiService.update(this.dataType, data.id, data);
    } else {
      saveData$ = this.apiService.create(this.dataType, data);
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

  onDelete(data: DataObject) {
    const name = (this.dataTypeName || this.dataType);
    this.dialogService.confirm(`Are you sure you want to delete this ${name}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  private delete(data: DataObject) {
    if (!this.dataType || !data.id) {
      return;
    }

    this.lajiForm?.block();
    this.apiService.delete(this.dataType, data.id).subscribe({
      'next': () => {
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Success!');
        this.navigateAway();
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Delete failed!');
        this.cdr.markForCheck();
      }
    });
  }

  private navigateAway() {
    this.router.navigate(['..'], {relativeTo: this.activeRoute});
  }
}

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
  HostListener,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../shared/services/form.service';
import { LajiForm, Person } from '@kotka/shared/models';
import { EMPTY, from, Observable, of, Subscription, switchMap } from 'rxjs';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../shared/services/user.service';
import { FormApiClient } from '../../../shared/services/api-services/form-api-client';
import { DialogService } from '../../../shared/services/dialog.service';
import { KotkaObject, ErrorMessages, KotkaObjectType } from '@kotka/api-interfaces';
import {
  FormErrorEnum,
  ErrorViewModel,
  SuccessViewModel,
  FormViewFacade,
  isErrorViewModel,
  isSuccessViewModel
} from './form-view.facade';
import { take, tap } from 'rxjs/operators';
import { ComponentCanDeactivate } from '../../../shared/services/guards/component-can-deactivate.guard';
import { FormViewUtils } from './form-view-utils';
import { DataService } from '../../../shared/services/data.service';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade]
})
export class FormViewComponent<T extends KotkaObjectType> implements OnChanges, OnDestroy, ComponentCanDeactivate {
  @Input() formId?: string;
  @Input() dataType?: T;
  @Input() dataTypeName?: string;
  @Input() augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
  @Input() getInitialFormDataFunc?: (user: Person) => Partial<KotkaObject<T>>;
  @Input() domain = 'http://tun.fi/';

  vm$: Observable<SuccessViewModel<T> | ErrorViewModel>;

  visibleDataTypeName?: string;

  showDeleteTargetInUseAlert = false;
  disabledAlertDismissed = false;
  formHasChanges = false;

  formErrorEnum = FormErrorEnum;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;

  @Output() formDataChange = new EventEmitter<Partial<KotkaObject<T>>>();
  @Output() formInit = new EventEmitter<{ lajiForm: LajiFormComponent; formData: Partial<KotkaObject<T>> }>();
  @Output() disabled = new EventEmitter<boolean>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;
  @ContentChild('headerTpl', {static: true}) formHeader?: TemplateRef<Element>;

  private vm?: SuccessViewModel<T>;
  private vmSub?: Subscription;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private formService: FormService,
    private dataService: DataService,
    private userService: UserService,
    private dialogService: DialogService,
    private router: Router,
    private formViewFacade: FormViewFacade<T>,
    private cdr: ChangeDetectorRef
  ) {
    this.vm$ = this.formViewFacade.vm$;

    this.vmSub = this.vm$.subscribe(vm => {
      if (this.isSuccessViewModel(vm)) {
        if (vm.state?.disabled !== undefined && vm.state.disabled !== this.vm?.state?.disabled) {
          this.disabled.emit(vm.state.disabled);
        }
        this.vm = vm;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['dataType'] || changes['augmentFormFunc'] || changes['getInitialFormDataFunc']) {
      if (this.formId && this.dataType) {
        this.formViewFacade.setInputs({
          formId: this.formId,
          dataType: this.dataType,
          augmentFormFunc: this.augmentFormFunc,
          getInitialFormDataFunc: this.getInitialFormDataFunc
        });
      }
    }

    this.visibleDataTypeName = this.dataTypeName || this.dataType;
  }

  ngOnDestroy() {
    this.vmSub?.unsubscribe();
  }

  @HostListener('window:beforeunload', ['$event'])
  preventLeave($event: any) {
    if (this.formHasChanges) {
      $event.returnValue = false;
    }
  }

  canDeactivate(): Observable<boolean> {
    if (!this.formHasChanges) {
      return of(true);
    }

    return this.dialogService.confirm('Are you sure you want to leave and discard unsaved changes?').pipe(
      tap(confirm => {
        if (confirm) {
          this.formHasChanges = false;
        }
      })
    );
  }

  onFormReady(data: KotkaObject<T>) {
    if (this.lajiForm) {
      this.formInit.emit({lajiForm: this.lajiForm, formData: data});
    }
  }

  onSubmit(data: KotkaObject<T>) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      'next': formData => {
        this.formHasChanges = false;

        this.navigateToEdit(formData.id || '').subscribe(() => {
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

  onDelete(data: KotkaObject<T>) {
    this.dialogService.confirm(`Are you sure you want to delete this ${this.visibleDataTypeName}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  onChange(data: Partial<KotkaObject<T>>) {
    this.formHasChanges = true;
    this.formDataChange.emit(data);
  }

  onCopy(data: KotkaObject<T>) {
    this.lajiForm?.block();

    if (!this.vm?.state?.disabled) {
      this.save$(data).subscribe({
        'next': data => {
          this.copyAsNew(data);
        },
        'error': () => {
          this.lajiForm?.unBlock();
          this.notifier.showError('Save failed!');
          this.cdr.markForCheck();
        }
      });
    } else {
      this.copyAsNew(data, ['owner']);
    }
  }

  setFormData(data: Partial<KotkaObject<T>>) {
    this.formViewFacade.setFormData(data);
  }

  private delete(data: KotkaObject<T>) {
    if (!this.dataType || !data.id) {
      return;
    }

    this.lajiForm?.block();
    this.dataService.delete(this.dataType, data.id).subscribe({
      'next': () => {
        this.formHasChanges = false;
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

  private save$(data: KotkaObject<T>): Observable<KotkaObject<T>> {
    if (!this.dataType) {
      return EMPTY;
    }

    let save$: Observable<KotkaObject<T>>;
    if (data.id) {
      save$ = this.dataService.update(this.dataType, data.id, data);
    } else {
      save$ = this.dataService.create(this.dataType, data);
    }

    return save$;
  }

  private copyAsNew(data: KotkaObject<T>, excludedFields: string[] = []) {
    excludedFields = excludedFields.concat(this.vm?.form?.excludeFromCopy || []);
    const newData = FormViewUtils.removeMetaAndExcludedFields<T>(data, excludedFields);

    return this.navigateToAdd().pipe(
      tap(() => {
        this.setFormData(newData);
        this.lajiForm?.unBlock();
      })
    ).subscribe();
  }

  private navigateAway() {
    this.router.navigate(['..'], { relativeTo: this.activeRoute });
  }

  private navigateToAdd(): Observable<boolean> {
    return from(this.router.navigate(['..', 'add'], { relativeTo: this.activeRoute }));
  }

  private navigateToEdit(id: string): Observable<boolean> {
    return from(this.router.navigate(['..', 'edit'], {
      relativeTo: this.activeRoute,
      queryParams: { uri: this.domain + id }
    }));
  }
}

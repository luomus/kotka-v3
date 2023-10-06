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
  HostListener
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../shared/services/form.service';
import { LajiForm, Person } from '@kotka/shared/models';
import { from, Observable, of, switchMap } from 'rxjs';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../shared/services/user.service';
import { FormApiClient } from '../../../shared/services/api-services/form-api-client';
import { DialogService } from '../../../shared/services/dialog.service';
import { DocumentObject, ErrorMessages, KotkaDocumentType } from '@kotka/api-interfaces';
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
export class FormViewComponent<T extends KotkaDocumentType> implements OnChanges, ComponentCanDeactivate {
  @Input() formId?: string;
  @Input() dataType?: T;
  @Input() dataTypeName?: string;
  @Input() augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
  @Input() getInitialFormDataFunc?: (user: Person) => Partial<DocumentObject<T>>;
  @Input() domain = 'http://tun.fi/';

  vm$: Observable<SuccessViewModel | ErrorViewModel>;

  visibleDataTypeName?: string;

  showDeleteTargetInUseAlert = false;
  disabledAlertDismissed = false;
  formHasChanges = false;

  formErrorEnum = FormErrorEnum;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;

  @Output() formDataChange = new EventEmitter<Partial<DocumentObject<T>>>();
  @Output() formReady = new EventEmitter<Partial<DocumentObject<T>>>();

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
    private formViewFacade: FormViewFacade,
    private cdr: ChangeDetectorRef
  ) {
    this.vm$ = this.formViewFacade.vm$;
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
    return this.dialogService.confirm('Are you sure you want to leave and discard unsaved changes?');
  }

  onSubmit(data: DocumentObject<T>) {
    if (!this.dataType) {
      return;
    }

    let saveData$: Observable<DocumentObject<T>>;
    if (data.id) {
      saveData$ = this.dataService.update(this.dataType, data.id, data);
    } else {
      saveData$ = this.dataService.create(this.dataType, data);
    }

    this.lajiForm?.block();
    saveData$.subscribe({
      'next': formData => {
        this.formHasChanges = false;
        from(this.router.navigate(['..', 'edit'], {
          relativeTo: this.activeRoute,
          queryParams: { uri: this.domain + formData.id }
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

  onDelete(data: DocumentObject<T>) {
    this.dialogService.confirm(`Are you sure you want to delete this ${this.visibleDataTypeName}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  onChange(data: Partial<DocumentObject<T>>) {
    this.formHasChanges = true;
    this.formDataChange.emit(data);
  }

  onCopy(data: Partial<DocumentObject<T>>) {
    if (this.formHasChanges) {
      this.dialogService.alert('The form has unsaved changes.');
      return;
    }

    const navigate$ = from(this.router.navigate(['..', 'add'], {
      relativeTo: this.activeRoute
    }));

    this.lajiForm?.block();

    this.vm$.pipe(take(1), switchMap((vm: SuccessViewModel) => {
      data = FormViewUtils.removeMetaAndExcludedFields(data, vm.form?.excludeFromCopy);

      return navigate$.pipe(
        tap(() => {
          this.setFormData(data);
          this.lajiForm?.unBlock();
        })
      );
    })).subscribe();
  }

  setFormData(data: Partial<DocumentObject<T>>) {
    this.formViewFacade.setFormData(data);
  }

  private delete(data: DocumentObject<T>) {
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

  private navigateAway() {
    this.router.navigate(['..'], { relativeTo: this.activeRoute });
  }
}

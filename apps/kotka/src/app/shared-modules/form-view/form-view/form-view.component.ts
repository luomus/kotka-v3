import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  TemplateRef,
  SimpleChanges,
  EventEmitter,
  Output,
  OnChanges,
  HostListener,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaDocumentObject, KotkaDocumentObjectType, LajiForm } from '@kotka/shared/models';
import { EMPTY, from, Observable, of, Subscription } from 'rxjs';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { FormApiClient } from '../../../shared/services/api-services/form-api-client';
import { DialogService } from '../../../shared/services/dialog.service';
import { ErrorMessages } from '@kotka/api-interfaces';
import {
  FormErrorEnum,
  ErrorViewModel,
  SuccessViewModel,
  FormViewFacade,
  isErrorViewModel,
  isSuccessViewModel
} from './form-view.facade';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { ComponentCanDeactivate } from '../../../shared/services/guards/component-can-deactivate.guard';
import { FormViewUtils } from './form-view-utils';
import { DataService } from '../../../shared/services/data.service';
import { IdService } from '../../../shared/services/id.service';
import { RoutingUtils } from '../../../shared/services/routing-utils';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade]
})
export class FormViewComponent implements OnChanges, OnDestroy, ComponentCanDeactivate {
  @Input() formId?: string;
  @Input() dataType?: KotkaDocumentObjectType;
  @Input() dataTypeName?: string;
  @Input() augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;

  @Input() headerTpl?: TemplateRef<any>;
  @Input() extraSectionTpl?: TemplateRef<any>;

  vm$: Observable<SuccessViewModel | ErrorViewModel>;

  visibleDataTypeName = '';

  showDeleteTargetInUseAlert = false;
  disabledAlertDismissed = false;
  formHasChanges = false;

  formErrorEnum = FormErrorEnum;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;

  @Output() formDataChange = new EventEmitter<Partial<KotkaDocumentObject>>();
  @Output() formInit = new EventEmitter<LajiFormComponent>();
  @Output() disabledChange = new EventEmitter<boolean>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  private vm?: SuccessViewModel;

  private subscription: Subscription = new Subscription();

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private dataService: DataService,
    private dialogService: DialogService,
    private router: Router,
    private formViewFacade: FormViewFacade,
    private cdr: ChangeDetectorRef
  ) {
    this.vm$ = this.formViewFacade.vm$;

    this.subscription.add(
      this.vm$.subscribe(vm => {
        this.vm = vm;
        this.cdr.markForCheck();
      })
    )

    this.subscription.add(
      RoutingUtils.navigationEnd$(this.router).subscribe(() => {
        this.formHasChanges = false;
        this.cdr.markForCheck();
      })
    );

    this.subscription.add(
      this.formViewFacade.state$.pipe(
        map(state => state?.disabled),
        filter(disabled => disabled !== undefined),
        distinctUntilChanged()
      ).subscribe(disabled => {
        this.disabledChange.emit(disabled);
        this.cdr.markForCheck();
      })
    );

    this.subscription.add(
      this.formViewFacade.formData$.subscribe(formData => {
        if (formData) {
          this.formDataChange.emit(formData);
          this.cdr.markForCheck();
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['dataType'] || changes['augmentFormFunc']) {
      if (this.formId && this.dataType) {
        this.formViewFacade.setInputs({
          formId: this.formId,
          dataType: this.dataType,
          augmentFormFunc: this.augmentFormFunc
        });
      }
    }

    this.visibleDataTypeName = this.dataTypeName || this.dataType || '';
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  onFormReady() {
    if (this.lajiForm) {
      this.formInit.emit(this.lajiForm);
    }
  }

  onSubmit(data: KotkaDocumentObject) {
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

  onDelete(data: KotkaDocumentObject) {
    this.dialogService.confirm(`Are you sure you want to delete this ${this.visibleDataTypeName}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  onChange(data: Partial<KotkaDocumentObject>) {
    this.formHasChanges = true;
    this.formDataChange.emit(data);
  }

  onCopy(data: KotkaDocumentObject) {
    const excludedFields = this.vm?.state?.disabled ? ['owner'] : [];
    this.copyAsNew(data, excludedFields);
  }

  onSubmitAndCopy(data: KotkaDocumentObject) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      'next': data => {
        this.formHasChanges = false;
        this.copyAsNew(data);
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      }
    });
  }

  setFormData(data: Partial<KotkaDocumentObject>) {
    this.formHasChanges = true;
    this.formViewFacade.setFormData(data);
    this.formDataChange.emit(data);
  }

  private setInitialFormData(data: Partial<KotkaDocumentObject>) {
    this.formViewFacade.setInitialFormData(data);
    this.formDataChange.emit(data);
  }

  private delete(data: KotkaDocumentObject) {
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

  private save$(data: KotkaDocumentObject): Observable<KotkaDocumentObject> {
    if (!this.dataType) {
      return EMPTY;
    }

    let save$: Observable<KotkaDocumentObject>;
    if (data.id) {
      save$ = this.dataService.update(this.dataType, data.id, data);
    } else {
      save$ = this.dataService.create(this.dataType, data);
    }

    return save$;
  }

  private copyAsNew(data: KotkaDocumentObject, excludedFields: string[] = []) {
    this.lajiForm?.block();

    excludedFields = excludedFields.concat(this.vm?.form?.excludeFromCopy || []);
    const newData = FormViewUtils.removeMetaAndExcludedFields(data, excludedFields);

    return this.navigateToAdd().pipe(
      tap(() => {
        this.setInitialFormData(newData);
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
      queryParams: { uri: IdService.getUri(id) }
    }));
  }
}

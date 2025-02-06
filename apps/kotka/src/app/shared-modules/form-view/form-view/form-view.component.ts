import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  TemplateRef,
  EventEmitter,
  Output,
  OnChanges,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaDocumentObjectType, KotkaDocumentObjectMap, LajiForm } from '@kotka/shared/models';
import { from, Observable, Subscription, switchMap } from 'rxjs';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ErrorMessages } from '@kotka/api-interfaces';
import {
  FormErrorEnum,
  ErrorViewModel,
  FormState,
  FormViewFacade,
  isErrorViewModel,
  isSuccessViewModel
} from './form-view.facade';
import { filter, take } from 'rxjs/operators';
import { FormViewUtils } from './form-view-utils';
import { ApiClient, IdService, ToastService, DialogService } from '@kotka/services';
import { Utils } from '../../../shared/services/utils';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade]
})
export class FormViewComponent<T extends KotkaDocumentObjectType = KotkaDocumentObjectType, S extends KotkaDocumentObjectMap[T] = KotkaDocumentObjectMap[T]> implements OnChanges, OnDestroy {
  @Input({ required: true }) formId!: string;
  @Input({ required: true }) dataType!: T;
  @Input() dataTypeName = '';
  @Input() augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;

  @Input() editModeHeaderTpl?: TemplateRef<unknown>;
  @Input() extraSectionTpl?: TemplateRef<unknown>;

  editMode = false;
  dataURI?: string;

  vm$: Observable<FormState<S> | ErrorViewModel>;

  formErrorEnum = FormErrorEnum;

  isErrorViewModel = isErrorViewModel;
  isSuccessViewModel = isSuccessViewModel;

  @Output() formDataChange = new EventEmitter<Partial<S|undefined>>();
  @Output() formInit = new EventEmitter<LajiFormComponent>();
  @Output() disabledChange = new EventEmitter<boolean|undefined>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  private state?: FormState<S>;
  private subscription: Subscription = new Subscription();

  constructor(
    private notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private apiClient: ApiClient,
    private dialogService: DialogService,
    private router: Router,
    private formViewFacade: FormViewFacade<T, S>,
    private cdr: ChangeDetectorRef
  ) {
    this.setRouteParamsIfChanged();

    this.vm$ = this.formViewFacade.vm$;

    this.initSubscriptions();
  }

  ngOnChanges() {
    this.updateInputs();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onFormReady() {
    if (this.lajiForm) {
      this.formInit.emit(this.lajiForm);
    }
  }
  onSubmit(data: S) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      'next': formData => {
        this.formViewFacade.setFormHasChanges(false);

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

  onDelete(data: Partial<S>) {
    this.dialogService.confirm(`Are you sure you want to delete this ${this.dataTypeName}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  onChange(data: Partial<S>) {
    this.formViewFacade.setFormData(data);
  }

  onCopy(data: Partial<S>) {
    const excludedFields = this.state?.disabled ? ['owner'] : [];
    this.copyAsNew(data, excludedFields);
  }

  onSubmitAndCopy(data: S) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      'next': data => {
        this.formViewFacade.setFormHasChanges(false);
        this.copyAsNew(data);
      },
      'error': () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      }
    });
  }

  setFormData(data: Partial<S>) {
    this.formViewFacade.setFormData(data);
    this.formDataChange.emit(data);
  }

  getFormHasChanges(): boolean {
    return this.state?.formHasChanges || false;
  }

  dismissDisabledAlert() {
    this.formViewFacade.setDisabledAlertDismissed(true);
  }

  hideDeleteTargetInUseAlert() {
    this.formViewFacade.setShowDeleteTargetInUseAlert(false);
  }

  private delete(data: Partial<S>) {
    if (!data.id) {
      return;
    }

    this.lajiForm?.block();
    this.apiClient.deleteDocument(this.dataType, data.id).subscribe({
      'next': () => {
        this.formViewFacade.setFormHasChanges(false);
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Success!');
        this.navigateAway();
      },
      'error': err => {
        this.lajiForm?.unBlock();

        if (err?.error?.message === ErrorMessages.deletionTargetInUse) {
          this.formViewFacade.setShowDeleteTargetInUseAlert(true);
        } else {
          this.notifier.showError('Delete failed!');
        }

        this.cdr.markForCheck();
      }
    });
  }

  private save$(data: S): Observable<S> {
    let save$: Observable<S>;
    if (data.id) {
      save$ = this.apiClient.updateDocument(this.dataType, data.id, data);
    } else {
      save$ = this.apiClient.createDocument(this.dataType, data);
    }

    return save$;
  }

  private copyAsNew(data: Partial<S>, excludedFields: string[] = []) {
    this.lajiForm?.block();

    excludedFields = excludedFields.concat(this.state?.form?.excludeFromCopy || []);
    const newData = FormViewUtils.removeMetaAndExcludedFields<S>(data, excludedFields);

    return this.navigateToAdd().pipe(
      switchMap(() => this.formViewFacade.formData$), // wait that the initial form data has loaded
      filter(formData => formData !== undefined),
      take(1)
    ).subscribe(() => {
      this.formViewFacade.setCopiedFormData(newData);
      this.lajiForm?.unBlock();
    });
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

  private initSubscriptions() {
    this.subscription.add(
      Utils.navigationEnd$(this.router).subscribe(() => {
        if (this.setRouteParamsIfChanged()) {
          this.updateInputs();
        }
      })
    );

    this.subscription.add(
      this.formViewFacade.state$.subscribe(state => {
        this.state = state;
        this.cdr.markForCheck();
      })
    );

    this.subscription.add(
      this.formViewFacade.disabled$.subscribe(disabled => {
        this.disabledChange.emit(disabled);
        this.cdr.markForCheck();
      })
    );

    this.subscription.add(
      this.formViewFacade.formData$.subscribe(formData => {
        this.formDataChange.emit(formData);
        this.cdr.markForCheck();
      })
    );
  }

  private setRouteParamsIfChanged(): boolean {
    const editMode = this.activeRoute.snapshot.url[0].path === 'edit';
    const dataURI = this.activeRoute.snapshot.queryParams['uri'];

    if (this.editMode !== editMode || this.dataURI !== dataURI) {
      this.editMode = editMode;
      this.dataURI = dataURI;
      return true;
    }

    return false;
  }

  private updateInputs() {
    this.formViewFacade.setInputs({
      formId: this.formId,
      dataType: this.dataType,
      editMode: this.editMode,
      dataURI: this.dataURI,
      augmentFormFunc: this.augmentFormFunc
    });
  }
}

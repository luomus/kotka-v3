import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  TemplateRef,
  OnDestroy,
  input,
  output, effect, signal, Signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KotkaDocumentObjectType, KotkaDocumentObjectMap, LajiForm } from '@kotka/shared/models';
import {
  from,
  Observable,
  Subscription,
  switchMap
} from 'rxjs';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ErrorMessages } from '@kotka/shared/models';
import {
  FormErrorEnum,
  FormState,
  FormViewFacade
} from './form-view.facade';
import { filter, take } from 'rxjs/operators';
import { FormViewUtils } from './form-view-utils';
import { ToastService, DialogService, navigationEnd$, ApiClient } from '@kotka/ui/services';
import { getUri } from '@kotka/shared/utils';
import { MainContentComponent } from '@kotka/ui/main-content';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { MetaFieldsComponent } from '../meta-fields/meta-fields.component';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { LabelPipe } from '@kotka/ui/pipes';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade],
  imports: [
    MainContentComponent,
    NgbAlert,
    MetaFieldsComponent,
    LajiFormComponent,
    SpinnerComponent,
    LabelPipe,
    NgTemplateOutlet,
    TitleCasePipe
  ],
})
export class FormViewComponent<
  T extends KotkaDocumentObjectType = KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T] = KotkaDocumentObjectMap[T],
> implements OnDestroy
{
  formId = input.required<string>();
  dataType = input.required<T>();
  dataTypeName = input('');

  augmentFormFunc =
    input<(form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>>();
  prefilledFormData = input<Partial<S>>();

  footerDisabled = input<boolean>();
  hiddenFields = input<string[]>();

  editModeHeaderTpl = input<TemplateRef<unknown>>();
  formContainerTpl = input<TemplateRef<unknown>>();
  metaFieldsContainerTpl = input<TemplateRef<unknown>>();

  editMode = signal(false);
  dataURI = signal<string | undefined>(undefined);

  formState: Signal<FormState<S>>;

  formErrorEnum = FormErrorEnum;

  formDataChange = output<Partial<S | undefined>>();
  formInit = output<LajiFormComponent>();
  disabledChange = output<boolean | undefined>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  private routeParamUpdateSub: Subscription;

  constructor(
    private notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private apiClient: ApiClient,
    private dialogService: DialogService,
    private router: Router,
    private formViewFacade: FormViewFacade<T, S>,
    private cdr: ChangeDetectorRef,
  ) {
    this.formState = this.formViewFacade.state;

    this.setRouteParams();

    this.routeParamUpdateSub = navigationEnd$(this.router).subscribe(() => {
      this.setRouteParams();
    });

    effect(() => {
      this.updateInputs();
    });

    effect(() => {
      this.formDataChange.emit(this.formViewFacade.formData());
    });

    effect(() => {
      this.disabledChange.emit(this.formViewFacade.disabled());
    });
  }

  ngOnDestroy() {
    this.routeParamUpdateSub.unsubscribe();
  }

  onFormReady() {
    if (this.lajiForm) {
      this.formInit.emit(this.lajiForm);
    }
  }
  onSubmit(data: S) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      next: (formData) => {
        this.formViewFacade.setFormHasChanges(false);

        this.navigateToEdit(formData.id || '').subscribe(() => {
          this.lajiForm?.unBlock();
          this.notifier.showSuccess('Save success!');
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      },
    });
  }

  onDelete(data: Partial<S>) {
    this.dialogService
      .confirm(`Are you sure you want to delete this ${this.dataTypeName}?`)
      .subscribe((confirm) => {
        if (confirm) {
          this.delete(data);
        }
      });
  }

  onChange(data: Partial<S>) {
    this.formViewFacade.setFormData(data);
  }

  onCopy(data: Partial<S>) {
    const excludedFields = this.formState().disabled ? ['owner'] : [];
    this.copyAsNew(data, excludedFields);
  }

  onSubmitAndCopy(data: S) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      next: (data) => {
        this.formViewFacade.setFormHasChanges(false);
        this.copyAsNew(data);
      },
      error: () => {
        this.lajiForm?.unBlock();
        this.notifier.showError('Save failed!');
        this.cdr.markForCheck();
      },
    });
  }

  setFormData(data: Partial<S>) {
    this.formViewFacade.setFormData(data, true, true);
    this.formDataChange.emit(data);
  }

  getFormHasChanges(): boolean {
    return this.formState().formHasChanges || false;
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
    this.apiClient.deleteDocument(this.dataType(), data.id).subscribe({
      next: () => {
        this.formViewFacade.setFormHasChanges(false);
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Success!');
        this.navigateAway();
      },
      error: (err) => {
        this.lajiForm?.unBlock();

        if (err?.error?.message === ErrorMessages.deletionTargetInUse) {
          this.formViewFacade.setShowDeleteTargetInUseAlert(true);
        } else {
          this.notifier.showError('Delete failed!');
        }

        this.cdr.markForCheck();
      },
    });
  }

  private save$(data: S): Observable<S> {
    if (this.editMode()) {
      if (!data.id) {
        throw new Error('Document is missing an id');
      }
      return this.apiClient.updateDocument(this.dataType(), data.id, data);
    } else {
      return this.apiClient.createDocument(this.dataType(), data);
    }
  }

  private copyAsNew(data: Partial<S>, excludedFields: string[] = []) {
    this.lajiForm?.block();

    excludedFields = excludedFields.concat(
      this.formState().form?.excludeFromCopy || [],
    );
    const newData = FormViewUtils.removeMetaAndExcludedFields<S>(
      data,
      excludedFields,
    );

    return this.navigateToAdd()
      .pipe(
        switchMap(() => toObservable(this.formViewFacade.formData)), // wait that the initial form data has loaded
        filter((formData) => formData !== undefined),
        take(1),
      )
      .subscribe(() => {
        this.formViewFacade.setCopiedFormData(newData);
        this.lajiForm?.unBlock();
      });
  }

  private navigateAway() {
    this.router.navigate(['..'], { relativeTo: this.activeRoute });
  }

  private navigateToAdd(): Observable<boolean> {
    return from(
      this.router.navigate(['..', 'add'], { relativeTo: this.activeRoute }),
    );
  }

  private navigateToEdit(id: string): Observable<boolean> {
    return from(
      this.router.navigate(['..', 'edit'], {
        relativeTo: this.activeRoute,
        queryParams: { uri: getUri(id) },
      }),
    );
  }

  private setRouteParams() {
    const editMode = this.activeRoute.snapshot.url[0].path === 'edit';
    const dataURI = this.activeRoute.snapshot.queryParams['uri'];

    this.editMode.set(editMode);
    this.dataURI.set(dataURI);
  }

  private updateInputs() {
    this.formViewFacade.setInputs({
      formId: this.formId(),
      dataType: this.dataType(),
      editMode: this.editMode(),
      dataURI: this.dataURI(),
      augmentFormFunc: this.augmentFormFunc(),
      prefilledFormData: this.prefilledFormData(),
    });
  }
}

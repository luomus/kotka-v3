import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ViewChild,
  TemplateRef,
  input,
  output,
  effect,
  Signal,
  inject,
  ElementRef
} from '@angular/core';
import { KotkaDocumentObjectType, KotkaDocumentObjectMap, LajiForm } from '@kotka/shared/models';
import {
  Observable
} from 'rxjs';
import { FormMediaMetadata, LajiFormComponent } from '@kotka/ui/laji-form';
import { ErrorMessages } from '@kotka/shared/models';
import {
  FormErrorEnum,
  FormState,
  FormViewFacade
} from './form-view.facade';
import { FormViewUtils } from './form-view-utils';
import { ToastService, DialogService, ApiClient } from '@kotka/ui/services';
import { MainContentComponent } from '@kotka/ui/main-content';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { MetaFieldsComponent } from '../meta-fields/meta-fields.component';
import { SpinnerComponent } from '@kotka/ui/spinner';
import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { LabelPipe } from '@kotka/ui/pipes';

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
>
{
  private notifier = inject(ToastService);
  private apiClient = inject(ApiClient);
  private dialogService = inject(DialogService);
  private formViewFacade = inject<FormViewFacade<T, S>>(FormViewFacade);
  private cdr = inject(ChangeDetectorRef);

  formId = input.required<string>();
  dataType = input.required<T>();
  dataTypeName = input('');

  editMode = input.required<boolean>();
  dataURI = input.required<string | undefined>();

  augmentFormFunc =
    input<(form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>>();
  prefilledFormData = input<Partial<S>>();
  mediaMetadata = input<FormMediaMetadata>();

  hiddenFields = input<string[]>();
  additionalClassNames = input<Record<string, string>>();
  confirmFieldDelete = input<boolean>();

  title = input<string>();
  allowCopy = input<boolean>();
  footerDisabled = input<boolean>();
  historyPageLink = input<string[]|string>(['..', 'history']);

  headerTpl = input<TemplateRef<unknown>>();
  formContainerTpl = input<TemplateRef<unknown>>();
  metaFieldsContainerTpl = input<TemplateRef<unknown>>();

  formState: Signal<FormState<S>>;

  formErrorEnum = FormErrorEnum;

  formDataChange = output<Partial<S | undefined>>();
  formInit = output<LajiFormComponent>();
  disabledChange = output<boolean | undefined>();

  saveSuccess = output<S>();
  deleteSuccess = output<void>();
  copyData = output<Partial<S>>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;
  @ViewChild('formActionAlerts') formActionAlerts?: ElementRef<HTMLDivElement>;

  constructor() {
    this.formState = this.formViewFacade.state;

    effect(() => {
      this.formViewFacade.setInputs({
        formId: this.formId(),
        dataType: this.dataType(),
        editMode: this.editMode(),
        dataURI: this.dataURI(),
        allowCopy: this.allowCopy(),
        augmentFormFunc: this.augmentFormFunc(),
        prefilledFormData: this.prefilledFormData(),
      });
    });

    effect(() => {
      this.formDataChange.emit(this.formViewFacade.formData());
    });

    effect(() => {
      this.disabledChange.emit(this.formViewFacade.disabled());
    });
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
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Save success!');
        this.saveSuccess.emit(formData);
      },
      error: (err) => {
        this.onSaveError(err);
      },
    });
  }

  onDelete(data: Partial<S>) {
    this.dialogService
      .confirm(`Are you sure you want to delete this ${this.dataTypeName()}?`)
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
        this.lajiForm?.unBlock();
        this.copyAsNew(data);
      },
      error: (err) => {
        this.onSaveError(err);
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

  hideUniqueIDRequiredAlert() {
    this.formViewFacade.setShowUniqueIDRequiredAlert(false);
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
        this.deleteSuccess.emit();
      },
      error: (err) => {
        this.lajiForm?.unBlock();

        if (err?.error?.message === ErrorMessages.deletionTargetInUse) {
          this.formViewFacade.setShowDeleteTargetInUseAlert(true);
          this.formActionAlerts?.nativeElement.scrollIntoView();
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
    excludedFields = excludedFields.concat(
      this.formState().form?.excludeFromCopy || [],
    );

    const newData = FormViewUtils.removeMetaAndExcludedFields<S>(
      data,
      excludedFields,
    );

    this.copyData.emit(newData);
  }

  private onSaveError(err: any) {
    this.lajiForm?.unBlock();

    if (err?.error?.message === ErrorMessages.uniqueIDRequired) {
      this.formViewFacade.setShowUniqueIDRequiredAlert(true);
      this.formActionAlerts?.nativeElement.scrollIntoView();
    } else {
      this.notifier.showError('Save failed!');
    }

    this.cdr.markForCheck();
  }
}

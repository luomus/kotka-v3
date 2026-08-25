import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  TemplateRef,
  input,
  output,
  effect,
  Signal,
  inject,
  computed,
} from '@angular/core';
import {
  LajiForm,
  KotkaMainDocumentType,
  KotkaDocument
} from '@kotka/shared/models';
import {
  Observable
} from 'rxjs';
import { FormMediaMetadata, LajiFormComponent } from '@kotka/ui/laji-form';
import {
  FormState
} from '../services/form.facade';
import { FormViewUtils } from '../services/form-view-utils';
import { ToastService, DialogService, ApiClient, LabelPipe, getDataTypeName, DataTypeNamePipePipe } from '@kotka/ui/core';
import {
  MainContentComponent,
  MainContentHeaderDirective,
  SpinnerComponent,
} from '@kotka/ui/components';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { MetaFieldsComponent } from '../meta-fields/meta-fields.component';
import { NgTemplateOutlet } from '@angular/common';
import { ErrorSchema } from '@rjsf/utils';
import { FormViewFacade } from '../services/form-view.facade';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade],
  imports: [
    MainContentComponent,
    MainContentHeaderDirective,
    NgbAlert,
    MetaFieldsComponent,
    LajiFormComponent,
    SpinnerComponent,
    LabelPipe,
    NgTemplateOutlet,
    DataTypeNamePipePipe,
  ],
})
export class FormViewComponent<
  T extends KotkaMainDocumentType = KotkaMainDocumentType
> {
  private notifier = inject(ToastService);
  private apiClient = inject(ApiClient);
  private dialogService = inject(DialogService);
  private formViewFacade = inject<FormViewFacade<T>>(FormViewFacade);

  formId = input.required<string>();
  dataType = input.required<T>();

  editMode = input.required<boolean>();
  dataURI = input.required<string | undefined>();
  formData = input<Partial<KotkaDocument<T>>>();
  hasChanges = input<boolean>();

  augmentFormFunc =
    input<(form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>>();
  mediaMetadata = input<FormMediaMetadata>();

  hiddenFields = input<string[]>();
  additionalClassNames = input<Record<string, string>>();
  confirmFieldDelete = input<boolean>();

  settingsKey = input<string>();

  pageTitle = input<string>();
  allowCopy = input<boolean>();
  footerDisabled = input<boolean>();
  historyPageLink = input<string[] | string>(['..', 'history']);

  headerTpl = input<TemplateRef<unknown>>();
  formContainerTpl = input<TemplateRef<unknown>>();
  metaFieldsContainerTpl = input<TemplateRef<unknown>>();
  customFooterButtonsTpl = input<TemplateRef<unknown>>();

  defaultPageTitle: Signal<string>;
  formState: Signal<FormState<KotkaDocument<T>>>;

  formDataChange = output<Partial<KotkaDocument<T> | undefined>>();
  formInit = output<LajiFormComponent>();
  disabledChange = output<boolean | undefined>();

  saveSuccess = output<KotkaDocument<T>>();
  deleteSuccess = output<void>();
  copyData = output<Partial<KotkaDocument<T>>>();
  validationError = output<ErrorSchema>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  constructor() {
    this.defaultPageTitle = computed(() => {
      const dataTypeName = getDataTypeName(this.dataType());
      if (this.editMode()) {
        return `Edit ${dataTypeName}` + (this.dataURI() ? ` ${this.dataURI()}` : '');
      } else {
        return `Add ${dataTypeName}`;
      }
    });

    this.formState = this.formViewFacade.state;

    effect(() => {
      this.formViewFacade.setInputs({
        formId: this.formId(),
        dataType: this.dataType(),
        editMode: this.editMode(),
        dataURI: this.dataURI(),
        formData: this.formData(),
        hasChanges: this.hasChanges(),
        allowCopy: this.allowCopy(),
        augmentFormFunc: this.augmentFormFunc(),
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

  onSubmit(data: KotkaDocument<T>) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      next: (formData) => {
        this.onSuccessResponse();
        this.notifier.showSuccess('Save success!');
        this.saveSuccess.emit(formData);
      },
      error: (err) => {
        FormViewUtils.handleErrorResponse(err, this.lajiForm, this.notifier);
      },
    });
  }

  onDelete(data: Partial<KotkaDocument<T>>) {
    this.dialogService
      .confirm(
        `Are you sure you want to delete this ${getDataTypeName(this.dataType())}?`,
      )
      .subscribe((confirm) => {
        if (confirm) {
          this.delete(data);
        }
      });
  }

  onChange(data: Partial<KotkaDocument<T>>) {
    this.formViewFacade.setFormData(data);
  }

  onCopy(data: Partial<KotkaDocument<T>>) {
    const excludedFields = this.formState().disabled ? ['owner'] : [];
    this.copyAsNew(data, excludedFields);
  }

  onSubmitAndCopy(data: KotkaDocument<T>) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      next: (data) => {
        this.onSuccessResponse();
        this.copyAsNew(data);
      },
      error: (err) => {
        FormViewUtils.handleErrorResponse(err, this.lajiForm, this.notifier);
      },
    });
  }

  setFormData(data: Partial<KotkaDocument<T>>) {
    this.formViewFacade.setFormData(data, true, true);
    this.formDataChange.emit(data);
  }

  getFormHasChanges(): boolean {
    return this.formState().formHasChanges || false;
  }

  dismissDisabledAlert() {
    this.formViewFacade.setDisabledAlertDismissed(true);
  }

  private delete(data: Partial<KotkaDocument<T>>) {
    if (!data.id) {
      return;
    }

    this.lajiForm?.block();
    this.apiClient.deleteDocument(this.dataType(), data.id).subscribe({
      next: () => {
        this.onSuccessResponse();
        this.notifier.showSuccess('Delete success!');
        this.deleteSuccess.emit();
      },
      error: (err) => {
        FormViewUtils.handleErrorResponse(err, this.lajiForm, this.notifier, 'Delete failed!');
      },
    });
  }

  private save$(data: KotkaDocument<T>): Observable<KotkaDocument<T>> {
    if (this.editMode()) {
      if (!data.id) {
        throw new Error('Document is missing an id');
      }
      return this.apiClient.updateDocument(this.dataType(), data.id, data);
    } else {
      return this.apiClient.createDocument(this.dataType(), data);
    }
  }

  private copyAsNew(data: Partial<KotkaDocument<T>>, excludedFields: string[] = []) {
    excludedFields = excludedFields.concat(
      this.formState().form?.excludeFromCopy || [],
    );

    const newData = FormViewUtils.removeMetaAndExcludedFields<KotkaDocument<T>>(
      data,
      excludedFields,
    );

    this.copyData.emit(newData);
  }

  private onSuccessResponse() {
    this.formViewFacade.setFormHasChanges(false);
    this.lajiForm?.unBlock();
  }
}

import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
  input,
  output,
  effect,
  DOCUMENT,
  inject,
  TemplateRef
} from '@angular/core';
import LajiForm from '@luomus/laji-form/lib/index';
import { Theme as LajiFormTheme } from '@luomus/laji-form/lib/themes/theme';
import { scrollIntoViewIfNeeded, uiSchemaJSONPointer, updateSafelyWithJSONPointer } from '@luomus/laji-form/lib/utils';
import { LajiForm as LajiFormModel } from '@kotka/shared/models';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MediaMetadata } from '@luomus/laji-form/lib/components/LajiForm';
import { Logger, ToastService, FormApiClient } from '@kotka/ui/core';
import { FormFooterComponent } from '../form-footer/form-footer.component';

type FormData = Record<string, any>;

@Component({
  selector: 'kui-laji-form',
  templateUrl: './laji-form.component.html',
  styleUrls: ['./laji-form.component.scss'],
  imports: [CommonModule, FormFooterComponent],
})
export class LajiFormComponent<T extends FormData = FormData>
  implements AfterViewInit, OnDestroy
{
  private document = inject<Document>(DOCUMENT);
  private apiClient = inject(FormApiClient);
  private notifier = inject(ToastService);
  private logger = inject(Logger);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  static TOP_OFFSET = 0;
  static BOTTOM_OFFSET = 50;
  form = input<LajiFormModel.SchemaForm | null>(null);
  formData = input<Partial<T>>({});
  editMode = input<boolean>();
  hasChanges = input<boolean>();
  disabled = input<boolean>();
  footerDisabled = input<boolean>();
  mediaMetadata = input<MediaMetadata>();
  hiddenFields = input<string[]>();
  additionalClassNames = input<Record<string, string>>();
  confirmFieldDelete = input<boolean>();

  showFooter = input(true);
  showDeleteButton = input<boolean>();
  showCopyButton = input<boolean>();
  customFooterButtonsTpl = input<TemplateRef<unknown>>();

  hasOnlyWarnings = false;

  private lajiFormWrapper?: LajiForm;
  private lajiFormWrapperProto?: any;
  private lajiFormTheme?: LajiFormTheme;
  private isBlocked = false;
  private copyAfterSubmit = false;

  formReady = output<void>();
  formDestroy = output<void>();

  formChange = output<Partial<T>>();
  formSubmit = output<T>();
  delete = output<Partial<T>>();
  formCopy = output<Partial<T>>();
  formSubmitAndCopy = output<T>();

  @ViewChild('lajiForm', { static: true }) lajiFormRoot!: ElementRef;

  constructor() {
    effect(() => {
      if (!this.form()) {
        return;
      }

      const form = this.form() as LajiFormModel.SchemaForm;
      const state = {
        schema: form.schema,
        uiSchema: this.getUiSchema(form, this.disabled(), this.hiddenFields()),
        uiSchemaContext: this.getUiSchemaContext(form, this.editMode(), this.additionalClassNames(), this.confirmFieldDelete()),
        formData: this.formData(),
        mediaMetadata: this.mediaMetadata(),
        validators: form.validators,
        warnings: form.warnings,
      };

      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.setState(state);
      });
    });
  }

  ngAfterViewInit() {
    this.mount();
  }

  ngOnDestroy() {
    this.unMount();
  }

  block() {
    if (!this.isBlocked && this.lajiFormWrapper) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.pushBlockingLoader();
      });
      this.isBlocked = true;
    }
  }

  unBlock() {
    if (this.isBlocked && this.lajiFormWrapper) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.popBlockingLoader();
      });
      this.isBlocked = false;
    }
  }

  openAllMultiActiveArrays() {
    this.lajiFormWrapper?.openAllMultiActiveArrays();
  }

  closeAllMultiActiveArrays() {
    this.lajiFormWrapper?.closeAllMultiActiveArrays();
  }

  focusField(id: string) {
    this.lajiFormWrapper?.focusField(id);
  }

  saveFormClicked() {
    this.copyAfterSubmit = false;
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper?.submit();
    });
  }

  saveAndCopyFormClicked() {
    this.copyAfterSubmit = true;
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper?.submit();
    });
  }

  highlightErrors() {
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper?.lajiForm.popErrorListIfNeeded();
      const errorListElem: HTMLElement | null = this.document.querySelector(
        '.laji-form-error-list',
      );
      if (errorListElem) {
        scrollIntoViewIfNeeded(
          errorListElem,
          LajiFormComponent.TOP_OFFSET,
          LajiFormComponent.BOTTOM_OFFSET,
        );
      }
    });
  }

  private mount() {
    combineLatest([
      import('@luomus/laji-form'),
      import('@luomus/laji-form/lib/themes/bs5'),
    ]).subscribe(([formPackage, themePackage]) => {
      this.lajiFormWrapperProto = formPackage.default;
      this.lajiFormTheme = themePackage.default;
      this.createNewLajiForm(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.formReady.emit();
          });
        }, 0);
      });
    });
  }

  private createNewLajiForm(onReady?: () => void) {
    if (this.lajiFormWrapperProto && this.form()) {
      const form = this.form() as LajiFormModel.SchemaForm;
      try {
        this.ngZone.runOutsideAngular(() => {
          this.unMount();

          this.lajiFormWrapper = new this.lajiFormWrapperProto({
            rootElem: this.lajiFormRoot.nativeElement,
            theme: this.lajiFormTheme,
            schema: form.schema,
            uiSchema: this.getUiSchema(form, this.disabled(), this.hiddenFields()),
            uiSchemaContext: this.getUiSchemaContext(form, this.editMode(), this.additionalClassNames(), this.confirmFieldDelete()),
            formData: this.formData(),
            validators: form.validators,
            warnings: form.warnings,
            onSubmit: this.onSubmit.bind(this),
            onChange: this.onChange.bind(this),
            onValidationError: this.onValidationError.bind(this),
            apiClient: this.apiClient,
            mediaMetadata: this.mediaMetadata(),
            lang: 'en',
            renderSubmit: false,
            topOffset: LajiFormComponent.TOP_OFFSET,
            bottomOffset: LajiFormComponent.BOTTOM_OFFSET,
            notifier: {
              success: (msg: string) => this.notifier?.showSuccess(msg),
              info: (msg: string) => this.notifier?.showInfo(msg),
              warning: (msg: string) => this.notifier?.showWarning(msg),
              error: (msg: string) => this.notifier?.showError(msg),
            },
            onError: this.onError.bind(this),
            componentDidMount: onReady ? onReady : () => undefined,
            optimizeOnChange: true,
          });
        });
      } catch (err) {
        console.log('Failed to load LajiForm', { error: err });
      }
    }
  }

  private getUiSchema(form: LajiFormModel.SchemaForm, disabled: boolean | undefined, hiddenFields: string[] | undefined) {
    let uiSchema = form.uiSchema;

    (hiddenFields || []).forEach(field => {
      let uiSchemaPointer: string|undefined;
      try {
        uiSchemaPointer = uiSchemaJSONPointer(form.schema, field);
      } catch (err) {
        this.logger.error('Failed to parse hidden field pointer', err);
      }

      if (uiSchemaPointer) {
        uiSchema = updateSafelyWithJSONPointer(
          uiSchema,
          { 'ui:field': 'HiddenField' },
          uiSchemaPointer
        );
      }
    });

    return { ...uiSchema, 'ui:readonly': disabled };
  }

  private getUiSchemaContext(form: LajiFormModel.SchemaForm, isEdit: boolean | undefined, additionalClassNames: Record<string, string> | undefined, confirmFieldDelete: boolean | undefined) {
    return {
      ...form.uiSchemaContext,
      isEdit,
      additionalClassNames,
      confirmDelete: confirmFieldDelete
    };
  }

  private onError(error: Error, info: any) {
    this.logger.error('LajiForm crashed', { error, info, document: this.formData() });
    this.notifier?.showError('An unexpected error occurred');
  }

  private unMount() {
    try {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.unmount();
      });
    } catch (err) {
      this.logger.error('Unmounting failed', err);
    }
    this.formDestroy.emit();
  }

  private onSubmit(data: { formData: T }) {
    this.ngZone.run(() => {
      this.hasOnlyWarnings = false;

      if (this.copyAfterSubmit) {
        this.formSubmitAndCopy.emit(data.formData);
      } else {
        this.formSubmit.emit(data.formData);
      }

      this.cdr.markForCheck();
    });
  }

  private onChange(data: Partial<T>) {
    this.ngZone.run(() => {
      this.hasOnlyWarnings = false;
      this.formChange.emit(data);
      this.cdr.markForCheck();
    });
  }

  private onValidationError(errors: any) {
    this.ngZone.run(() => {
      if (this.onlyWarnings(errors)) {
        this.hasOnlyWarnings = true;
        this.cdr.markForCheck();
      }
    });
  }

  private onlyWarnings(errors: any): boolean {
    if (
      errors.__errors?.length > 0 &&
      errors.__errors.every((e: string) => e.indexOf('[warning]') === 0)
    ) {
      return true;
    }
    return (
      Object.keys(errors).length > 0 &&
      Object.keys(errors).every(
        (key) => key !== '__errors' && this.onlyWarnings(errors[key]),
      )
    );
  }
}

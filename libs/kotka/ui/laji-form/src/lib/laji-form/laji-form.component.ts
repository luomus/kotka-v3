import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  EventEmitter,
  Output,
  OnChanges, SimpleChanges, ChangeDetectorRef, Inject,
} from '@angular/core';
import LajiForm from 'laji-form/lib/index';
import { Theme as LajiFormTheme } from 'laji-form/lib/themes/theme';
import { scrollIntoViewIfNeeded } from 'laji-form/lib/utils';
import { LajiForm as LajiFormModel } from '@kotka/shared/models';
import { combineLatest } from 'rxjs';
import { Notifier } from '../models';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'kui-laji-form',
  templateUrl: './laji-form.component.html',
  styleUrls: ['./laji-form.component.scss'],
})
export class LajiFormComponent implements AfterViewInit, OnChanges, OnDestroy {
  static TOP_OFFSET = 0;
  static BOTTOM_OFFSET = 50;
  @Input() form: LajiFormModel.SchemaForm | null = null;
  @Input() formData: any = {};
  @Input() hasChanges = false;
  @Input() disabled = false;
  @Input() apiClient?: any;
  @Input() notifier?: Notifier;
  @Input() showFooter = true;
  @Input() showDeleteButton = false;
  @Input() showCopyButton = false;

  hasOnlyWarnings = false;

  private lajiFormWrapper?: LajiForm;
  private lajiFormWrapperProto?: any;
  private lajiFormTheme?: LajiFormTheme;
  private isBlocked = false;
  private copyAfterSubmit = false;

  @Output() formReady: EventEmitter<any> = new EventEmitter<any>();
  @Output() formDestroy: EventEmitter<void> = new EventEmitter<void>();

  @Output() formChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() formCopy: EventEmitter<any> = new EventEmitter<any>();
  @Output() formSubmitAndCopy: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('lajiForm', { static: true }) lajiFormRoot!: ElementRef;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    this.mount();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.lajiFormWrapper || !this.form) {
      return;
    }

    if (changes['form'] || changes['formData']) {
      const form = this.form as LajiFormModel.SchemaForm;

      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.setState({
          schema: form.schema,
          uiSchema: form.uiSchema,
          formData: this.formData,
          validators: form.validators,
          warnings: form.warnings
        });
      });
    }
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
      const errorListElem: HTMLElement|null = this.document.querySelector('.laji-form-error-list');
      if (errorListElem) {
        scrollIntoViewIfNeeded(errorListElem, LajiFormComponent.TOP_OFFSET, LajiFormComponent.BOTTOM_OFFSET);
      }
    });
  }

  private mount() {
    combineLatest([
      import('laji-form'),
      import('laji-form/lib/themes/bs5')
    ]).subscribe(([formPackage, themePackage]) => {
      this.lajiFormWrapperProto = formPackage.default;
      this.lajiFormTheme = themePackage.default;
      this.createNewLajiForm(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.formReady.emit(this.formData);
          });
        }, 0);
      });
    });
  }

  private createNewLajiForm(onReady?: () => void) {
    if (this.lajiFormWrapperProto && this.form) {
      const form = this.form as LajiFormModel.SchemaForm;
      try {
        this.ngZone.runOutsideAngular(() => {
          this.unMount();

          this.lajiFormWrapper = new this.lajiFormWrapperProto({
            rootElem: this.lajiFormRoot.nativeElement,
            theme: this.lajiFormTheme,
            schema: form.schema,
            uiSchema: { ...form.uiSchema, 'ui:readonly': this.disabled },
            uiSchemaContext: form.uiSchemaContext,
            formData: this.formData,
            validators: form.validators,
            warnings: form.warnings,
            onSubmit: this.onSubmit.bind(this),
            onChange: this.onChange.bind(this),
            onValidationError: this.onValidationError.bind(this),
            apiClient: this.apiClient,
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
            onComponentDidMount: onReady ? onReady() : () => undefined,
            optimizeOnChange: true
          });
        });
      } catch (err) {
        console.log('Failed to load LajiForm', {error: err});
      }
    }
  }

  private onError(error: Error, info: any) {
    console.log('LajiForm crashed', {error, info, document: this.formData});
    this.notifier?.showError('An unexpected error occurred');
  }

  private unMount() {
    try {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.unmount();
      });
    } catch (err) {
      console.log('Unmounting failed', err);
    }
    this.formDestroy.emit();
  }

  private onSubmit(data: any) {
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

  private onChange(data: any) {
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
    if (errors.__errors?.length > 0 && errors.__errors.every((e: string) => e.indexOf('[warning]') === 0)) {
      return true;
    }
    return Object.keys(errors).length > 0 && Object.keys(errors).every(key => key !== '__errors' && this.onlyWarnings(errors[key]));
  }
}

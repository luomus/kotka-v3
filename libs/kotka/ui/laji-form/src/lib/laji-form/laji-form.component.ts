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
} from '@angular/core';
import LajiForm from 'laji-form/lib/index';
import { Theme as LajiFormTheme } from 'laji-form/lib/themes/theme';
import { LajiForm as LajiFormModel } from '@kotka/shared/models';
import { combineLatest } from 'rxjs';
import { Notifier } from '../models';

@Component({
  selector: 'kui-laji-form',
  templateUrl: './laji-form.component.html',
  styleUrls: ['./laji-form.component.scss'],
})
export class LajiFormComponent implements AfterViewInit, OnDestroy {
  static TOP_OFFSET = 0;
  static BOTTOM_OFFSET = 50;
  @Input() form: LajiFormModel.SchemaForm | null = null;
  @Input() formData: any = {};
  @Input() disabled = false;
  @Input() showDeleteButton = false;
  @Input() apiClient?: any;
  @Input() notifier?: Notifier;

  private lajiFormWrapper?: LajiForm;
  private lajiFormWrapperProto?: any;
  private lajiFormTheme?: LajiFormTheme;
  private isBlocked = false;

  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('lajiForm', { static: true }) lajiFormRoot!: ElementRef;

  constructor(
    private ngZone: NgZone
  ) {}

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

  saveFormClicked() {
    this.ngZone.runOutsideAngular(() => {
      this.lajiFormWrapper?.submit();
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
        this.lajiFormWrapper?.invalidateSize();
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
            uiSchema: form.uiSchema,
            uiSchemaContext: form.uiSchemaContext,
            formData: this.formData,
            validators: form.validators,
            warnings: form.warnings,
            onSubmit: this.onSubmit.bind(this),
            onChange: this.onChange.bind(this),
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
            optimizeOnChange: true,
            disabled: this.disabled
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
  }

  private onSubmit(data: any) {
    this.ngZone.run(() => {
      this.formSubmit.emit(data.formData);
    });
  }

  private onChange(data: any) {

  }
}

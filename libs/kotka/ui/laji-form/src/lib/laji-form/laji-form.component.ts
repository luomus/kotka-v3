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

@Component({
  selector: 'kui-laji-form',
  templateUrl: './laji-form.component.html',
  styleUrls: ['./laji-form.component.scss'],
})
export class LajiFormComponent implements AfterViewInit, OnDestroy {
  @Input() form: LajiFormModel.SchemaForm | null = null;
  @Input() formData: any = {};

  private lajiFormWrapper?: LajiForm;
  private lajiFormWrapperProto?: any;
  private lajiFormTheme?: LajiFormTheme;
  private isBlocked = false;

  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();

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
    if (!this.isBlocked) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.pushBlockingLoader();
      });
      this.isBlocked = true;
    }
  }

  unBlock() {
    if (this.isBlocked) {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.popBlockingLoader();
      });
      this.isBlocked = false;
    }
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
          /*this.apiClient.lang = this.translate.currentLang;
          this.apiClient.personToken = this.userService.getToken();
          this.apiClient.formID = this.form.id;*/
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
            // onChange: this._onChange.bind(this),
            // onSettingsChange: this._onSettingsChange.bind(this),
            // onValidationError: this._onValidationError.bind(this),
            // settings: this.settings,
            // apiClient: this.apiClient,
            lang: 'en',
            renderSubmit: true,
            // topOffset: LajiFormComponent.TOP_OFFSET,
            // bottomOffset: LajiFormComponent.BOTTOM_OFFSET,
            /*notifier: {
              success: msg => this.toastsService.showSuccess(msg),
              info: msg => this.toastsService.showInfo(msg),
              warning: msg => this.toastsService.showWarning(msg),
              error: msg => this.toastsService.showError(msg),
            },*/
            // showShortcutButton: this.showShortcutButton,
            // onError: this._onError,
            onComponentDidMount: onReady ? onReady() : () => undefined,
            optimizeOnChange: true
          });
        });
      } catch (err) {
        // this.logger.error('Failed to load LajiForm', {error: err});
      }
    }
  }

  private unMount() {
    try {
      this.ngZone.runOutsideAngular(() => {
        this.lajiFormWrapper?.unmount();
      });
    } catch (err) {
      // this.logger.warn('Unmounting failed', err);
    }
  }

  private onSubmit(data: any) {
    this.ngZone.run(() => {
      this.formSubmit.emit(data.formData);
    });
  }
}

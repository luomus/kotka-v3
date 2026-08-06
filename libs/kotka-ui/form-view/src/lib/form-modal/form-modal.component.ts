import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Signal,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ApiClient, ToastService } from '@kotka/ui/core';
import { SpinnerComponent } from '@kotka/ui/components';
import {
  KotkaDocumentObjectMap,
  KotkaDocumentObjectType,
} from '@kotka/shared/models';
import { FormErrorEnum, FormState, FormViewFacade } from '../form-view/form-view.facade';
import { FormViewUtils } from '../form-view/form-view-utils';
import { ErrorSchema } from '@rjsf/utils';

@Component({
  selector: 'kotka-form-modal',
  templateUrl: './form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade],
  imports: [LajiFormComponent, SpinnerComponent, NgbAlert],
})
export class FormModalComponent<
  T extends KotkaDocumentObjectType = KotkaDocumentObjectType,
  S extends KotkaDocumentObjectMap[T] = KotkaDocumentObjectMap[T],
> {
  modal = inject(NgbActiveModal);
  private facade = inject<FormViewFacade<T, S>>(FormViewFacade);
  private apiClient = inject(ApiClient);
  private notifier = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  formId!: string;
  dataType!: T;
  editMode = false;
  formData?: Partial<S>;
  title = '';

  formState: Signal<FormState<S>>;
  formErrorEnum = FormErrorEnum;

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  constructor() {
    this.formState = this.facade.state;

    afterNextRender(() => {
      this.facade.setInputs({
        formId: this.formId,
        dataType: this.dataType,
        editMode: this.editMode,
        formData: this.formData
      });
    });
  }

  onChange(data: Partial<S>) {
    this.facade.setFormData(data);
  }

  save() {
    this.lajiForm?.submitForm();
  }

  onSubmit(data: S) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      next: (result) => {
        this.facade.setFormHasChanges(false);
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Save success!');
        this.modal.close(result);
      },
      error: (err) => {
        this.onErrorResponse(err);
      },
    });
  }

  private save$(data: S): Observable<S> {
    if (this.editMode && data.id) {
      return this.apiClient.updateDocument(this.dataType, data.id, data);
    } else {
      return this.apiClient.createDocument(this.dataType, data);
    }
  }

  private onErrorResponse(err: any) {
    if (err.error?.errorCode === 'VALIDATION_EXCEPTION') {
      this.lajiForm?.showErrors(
        FormViewUtils.apiValidationErrorsToRJSFErrorSchema(err.error),
      );
    } else if (err.status === 413) {
      this.lajiForm?.showErrors({
        __errors: ['Content is too large.'],
      } as ErrorSchema);
    } else {
      this.notifier.showError('Save failed!');
    }

    this.lajiForm?.unBlock();
    this.cdr.markForCheck();
  }
}


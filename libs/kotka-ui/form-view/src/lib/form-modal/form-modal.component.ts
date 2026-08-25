import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal, NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService, DialogService } from '@kotka/ui/core';
import {
  ModalComponent,
  ModalFooterDirective,
  ModalHeaderDirective,
  SpinnerComponent,
} from '@kotka/ui/components';
import { FormState, FormFacade } from '../services/form.facade';
import { FormViewUtils } from '../services/form-view-utils';
import { Observable } from 'rxjs';

@Component({
  selector: 'kotka-form-modal',
  templateUrl: './form-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormFacade],
  imports: [LajiFormComponent, SpinnerComponent, NgbAlert, ModalComponent, ModalHeaderDirective, ModalFooterDirective],
})
export class FormModalComponent<T extends FormData> {
  modal = inject(NgbActiveModal);

  private facade = inject<FormFacade<T>>(FormFacade);
  private notifier = inject(ToastService);
  private dialogService = inject(DialogService);

  formId!: string;
  editMode = false;
  formData?: Partial<T>;
  allowEdit?: false;
  allowDelete?: false;

  title = '';
  save$!: (data: T) => Observable<T>;
  delete$!: (data: Partial<T>) => Observable<void>;

  formState: Signal<FormState<T>>;

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;

  constructor() {
    this.formState = this.facade.state;

    afterNextRender(() => {
      this.facade.setInputs({
        formId: this.formId,
        editMode: this.editMode,
        formData: this.formData,
        allowEdit: this.allowEdit,
        allowDelete: this.allowDelete,
      });
    });
  }

  onChange(data: Partial<T>) {
    this.facade.setFormData(data);
  }

  save() {
    this.lajiForm?.submitForm();
  }

  onSubmit(data: T) {
    this.lajiForm?.block();

    this.save$(data).subscribe({
      next: (result) => {
        this.facade.setFormHasChanges(false);
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Save success!');
        this.modal.close(result);
      },
      error: (err) => {
        FormViewUtils.handleErrorResponse(err, this.lajiForm, this.notifier);
      },
    });
  }

  delete() {
    this.dialogService.confirm('Are you sure you want to delete this?').subscribe((confirm) => {
      if (!confirm) {
        return;
      }

      const formData = this.formState().formData;
      if (!formData) {
        return;
      }

      this.lajiForm?.block();

      this.delete$(formData).subscribe({
        next: () => {
          this.notifier.showSuccess('Delete success!');
          this.modal.close('delete');
        },
        error: (err) => {
          FormViewUtils.handleErrorResponse(err, this.lajiForm, this.notifier, 'Delete failed!');
        },
      });
    });
  }
}


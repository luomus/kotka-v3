import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewChild,
  ContentChild,
  TemplateRef,
  SimpleChanges,
  EventEmitter,
  Output,
  OnChanges
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from '../../../shared/services/api-services/form.service';
import { LajiForm, Person } from '@kotka/shared/models';
import { from, Observable } from 'rxjs';
import { DataObject, DataService, DataType } from '../../../shared/services/api-services/data.service';
import { LajiFormComponent } from '@kotka/ui/laji-form';
import { ToastService } from '../../../shared/services/toast.service';
import { UserService } from '../../../shared/services/api-services/user.service';
import { FormApiClient } from '../../../shared/services/api-services/form-api-client';
import { DialogService } from '../../../shared/services/dialog.service';
import { ErrorMessages } from '@kotka/api-interfaces';
import {
  FormErrorEnum,
  ErrorViewModel,
  SuccessViewModel,
  FormViewFacade,
  isErrorViewModel,
  asErrorViewModel
} from './form-view.facade';

@Component({
  selector: 'kotka-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormViewFacade]
})
export class FormViewComponent implements OnChanges {
  @Input() formId?: string;
  @Input() dataType?: DataType;
  @Input() dataTypeName?: string;
  @Input() augmentFormFunc?: (form: LajiForm.SchemaForm) => Observable<LajiForm.SchemaForm>;
  @Input() getInitialFormDataFunc?: (user: Person) => Partial<DataObject>;
  @Input() domain = 'http://tun.fi/';

  vm$: Observable<SuccessViewModel | ErrorViewModel>;

  visibleDataTypeName?: string;
  showDeleteTargetInUseAlert = false;
  disabledAlertDismissed = false;

  formErrorEnum = FormErrorEnum;

  isErrorViewModel = isErrorViewModel;
  asErrorViewModel = asErrorViewModel;

  @Output() formDataChange = new EventEmitter<Partial<DataObject>>();
  @Output() formReady = new EventEmitter<void>();

  @ViewChild(LajiFormComponent) lajiForm?: LajiFormComponent;
  @ContentChild('headerTpl', {static: true}) formHeader?: TemplateRef<Element>;

  constructor(
    public formApiClient: FormApiClient,
    public notifier: ToastService,
    private activeRoute: ActivatedRoute,
    private formService: FormService,
    private dataService: DataService,
    private userService: UserService,
    private dialogService: DialogService,
    private router: Router,
    private formViewFacade: FormViewFacade,
    private cdr: ChangeDetectorRef
  ) {
    this.vm$ = this.formViewFacade.vm$;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formId'] || changes['dataType'] || changes['augmentFormFunc'] || changes['getInitialFormDataFunc']) {
      if (this.formId && this.dataType) {
        this.formViewFacade.setInputs({
          formId: this.formId,
          dataType: this.dataType,
          augmentFormFunc: this.augmentFormFunc,
          getInitialFormDataFunc: this.getInitialFormDataFunc
        });
      }
    }

    this.visibleDataTypeName = this.dataTypeName || this.dataType;
  }

  onSubmit(data: DataObject) {
    if (!this.dataType) {
      return;
    }

    let saveData$: Observable<DataObject>;
    if (data.id) {
      saveData$ = this.dataService.update(this.dataType, data.id, data);
    } else {
      saveData$ = this.dataService.create(this.dataType, data);
    }

    this.lajiForm?.block();
    saveData$.subscribe({
      'next': formData => {
        from(this.router.navigate(['..', 'edit'], {
          relativeTo: this.activeRoute,
          queryParams: {uri: this.domain + formData.id}
        })).subscribe(() => {
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

  onDelete(data: DataObject) {
    this.dialogService.confirm(`Are you sure you want to delete this ${this.visibleDataTypeName}?`).subscribe(confirm => {
      if (confirm) {
        this.delete(data);
      }
    });
  }

  onCopy(data: DataObject) {
    console.log(data);
  }

  setFormData(data: Partial<DataObject>) {
    this.formViewFacade.setFormData(data);
  }

  private delete(data: DataObject) {
    if (!this.dataType || !data.id) {
      return;
    }

    this.lajiForm?.block();
    this.dataService.delete(this.dataType, data.id).subscribe({
      'next': () => {
        this.lajiForm?.unBlock();
        this.notifier.showSuccess('Success!');
        this.navigateAway();
      },
      'error': err => {
        this.lajiForm?.unBlock();

        if (err?.error?.message === ErrorMessages.deletionTargetInUse) {
          this.showDeleteTargetInUseAlert = true;
        } else {
          this.notifier.showError('Delete failed!');
        }

        this.cdr.markForCheck();
      }
    });
  }

  private navigateAway() {
    this.router.navigate(['..'], {relativeTo: this.activeRoute});
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  KotkaDocumentObjectType,
  LajiForm,
  SpecimenTransaction,
  isSpecimenTransaction,
} from '@kotka/shared/models';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { FormService, DialogService } from '@kotka/services';
import { FormViewComponent } from '../../shared-modules/form-view/form-view/form-view.component';
import {
  LajiFormComponent,
} from '@kotka/ui/laji-form';
import { ApiClient } from '@kotka/services';
import { TransactionFormEmbedService } from '../transaction-form-embed/transaction-form-embed.service';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '../../shared-modules/form-view/form-view/form-view-container';


@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionFormComponent extends FormViewContainerComponent implements OnDestroy {
  formId = globals.transactionFormId;
  dataType: KotkaDocumentObjectType.transaction = KotkaDocumentObjectType.transaction;
  augmentFormFunc = this.augmentForm.bind(this);

  formData?: SpecimenTransaction|Partial<SpecimenTransaction>;

  isSpecimenTransaction = isSpecimenTransaction;

  @ViewChild(FormViewComponent, { static: true }) formView!: FormViewComponent<KotkaDocumentObjectType.transaction>;

  private specimenRangeButtonClickSubscription?: Subscription;

  private disabled = false;

  constructor(
    private apiClient: ApiClient,
    private formService: FormService,
    dialogService: DialogService,
    private transactionFormEmbedService: TransactionFormEmbedService
  ) {
    super(dialogService);
  }

  ngOnDestroy() {
    this.specimenRangeButtonClickSubscription?.unsubscribe();
  }

  onFormInit(lajiForm: LajiFormComponent) {
    this.transactionFormEmbedService.initEmbeddedComponents(lajiForm, this.formData || {});
    this.specimenRangeButtonClickSubscription = this.transactionFormEmbedService.specimenRangeClick$?.subscribe(range => (
      this.specimenRangeClick(range)
    ));

    if (this.disabled) {
      this.setDisabled(this.disabled);
    }
  }

  onFormDataChange(formData?: Partial<SpecimenTransaction>) {
    this.formData = formData;
    this.transactionFormEmbedService.updateEmbeddedComponents(formData);
  }

  setDisabled(disabled?: boolean) {
    if (disabled !== undefined) {
      this.disabled = disabled;
      this.transactionFormEmbedService.setEmbeddedComponentsDisabled(disabled);
    }
  }

  private augmentForm(form: LajiForm.SchemaForm): Observable<LajiForm.SchemaForm> {
    return this.formService.getAllCountryOptions().pipe(switchMap(countries => {
      form.schema.properties.geneticResourceAcquisitionCountry.oneOf = countries;
      return of(form);
    }));
  }

  specimenRangeClick(range: string) {
    if (!range) {
      return;
    }
    if (!/^([A-Z0-9]+\.)?[0-9]+-[0-9]+$/g.test(range)) {
      this.dialogService.alert('Incorrect range format');
      return;
    }

    this.formView.lajiForm?.block();
    this.apiClient.getSpecimenRange(range).subscribe({
      'next': result => {
        if (result.status === 'ok') {
          const awayIDs = [...(this.formData?.awayIDs || []), ...(result.items || [])];
          const formData = {...this.formData || {}, awayIDs};
          this.formView.setFormData(formData);

          this.transactionFormEmbedService.clearSpecimenRangeSelect();
        } else {
          this.dialogService.alert(result.status);
        }
        this.formView.lajiForm?.unBlock();
      },
      'error': () => {
        this.dialogService.alert('An unexpected error occurred.');
        this.formView.lajiForm?.unBlock();
      }
    });
  }
}

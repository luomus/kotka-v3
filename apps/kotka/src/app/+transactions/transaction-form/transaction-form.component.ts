import {
  ChangeDetectionStrategy,
  Component, computed,
  OnDestroy, signal, Signal,
  ViewChild, inject
} from '@angular/core';
import {
  KotkaDocumentObjectType,
  LajiForm,
  SpecimenTransaction,
  isSpecimenTransaction,
} from '@kotka/shared/models';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { Logger, UserService } from '@kotka/ui/services';
import { FormViewComponent } from '@kotka/ui/form-view';
import { FormMediaMetadata, LajiFormComponent } from '@kotka/ui/laji-form';
import { ApiClient, FormService } from '@kotka/ui/services';
import { TransactionFormEmbedService } from '../transaction-form-embed/transaction-form-embed.service';
import { globals } from '../../../environments/globals';
import { FormViewContainerComponent } from '@kotka/ui/form-view';
import { TransactionPdfSheetsComponent } from '../transaction-pdf-sheets/transaction-pdf-sheets.component';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'kotka-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormViewComponent, TransactionPdfSheetsComponent],
  providers: [TransactionFormEmbedService],
})
export class TransactionFormComponent
  extends FormViewContainerComponent<KotkaDocumentObjectType.transaction>
  implements OnDestroy
{
  formId = globals.transactionFormId;
  dataType: KotkaDocumentObjectType.transaction =
    KotkaDocumentObjectType.transaction;
  augmentFormFunc = this.augmentForm.bind(this);
  mediaMetadata: Signal<FormMediaMetadata>;

  formData?: SpecimenTransaction | Partial<SpecimenTransaction>;

  isSpecimenTransaction = isSpecimenTransaction;

  @ViewChild(FormViewComponent, { static: true })
  formView!: FormViewComponent<KotkaDocumentObjectType.transaction>;

  private userName: Signal<string | undefined>;
  private owner = signal<string | undefined>(undefined);

  private specimenRangeButtonClickSubscription?: Subscription;

  private disabled = false;

  private apiClient = inject(ApiClient);
  private formService = inject(FormService);
  private logger = inject(Logger);
  private transactionFormEmbedService = inject(TransactionFormEmbedService);
  private userService = inject(UserService);

  constructor() {
    super();

    this.userName = toSignal(
      this.userService.getCurrentLoggedInUser().pipe(
        map(user => user.fullName)
      )
    );

    this.mediaMetadata = computed(() => ({
      intellectualRights: 'MZ.intellectualRightsARR',
      intellectualOwner: this.owner() || '',
      capturerVerbatim: this.userName(),
      publicityRestrictions: 'MZ.publicityRestrictionsPrivate',
    }));
  }

  override ngOnDestroy() {
    this.specimenRangeButtonClickSubscription?.unsubscribe();
    super.ngOnDestroy();
  }

  onFormInit(lajiForm: LajiFormComponent) {
    this.transactionFormEmbedService.initEmbeddedComponents(
      lajiForm,
      this.formData || {},
    );
    this.specimenRangeButtonClickSubscription =
      this.transactionFormEmbedService.specimenRangeClick$?.subscribe((range) =>
        this.specimenRangeClick(range),
      );

    if (this.disabled) {
      this.setDisabled(this.disabled);
    }
  }

  onFormDataChange(formData?: Partial<SpecimenTransaction>) {
    this.formData = formData;
    this.transactionFormEmbedService.updateEmbeddedComponents(formData);

    this.owner.set(this.formData?.owner);
  }

  setDisabled(disabled?: boolean) {
    if (disabled !== undefined) {
      this.disabled = disabled;
      this.transactionFormEmbedService.setEmbeddedComponentsDisabled(disabled);
    }
  }

  private augmentForm(
    form: LajiForm.SchemaForm,
  ): Observable<LajiForm.SchemaForm> {
    return this.formService.getAllCountryOptions().pipe(
      switchMap((countries) => {
        form.schema.properties.geneticResourceAcquisitionCountry.oneOf =
          countries;
        return of(form);
      }),
    );
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
      next: (result) => {
        if (result.status === 'ok') {
          const awayIDs = [
            ...(this.formData?.awayIDs || []),
            ...(result.items || []),
          ];
          const formData = { ...(this.formData || {}), awayIDs };
          this.formView.setFormData(formData);

          this.transactionFormEmbedService.clearSpecimenRangeSelect();
        } else {
          this.dialogService.alert(result.status);
        }
        this.formView.lajiForm?.unBlock();
      },
      error: (e) => {
        this.logger.error('Failed to fetch a specimen range', {
          error: e,
          range: range,
        });
        this.dialogService.alert('An unexpected error occurred.');
        this.formView.lajiForm?.unBlock();
      },
    });
  }
}

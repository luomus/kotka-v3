import { ChangeDetectionStrategy, Component, ViewEncapsulation, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { ApiClient } from '@kotka/services';
import { FormViewUtils } from '../shared-modules/form-view/form-view/form-view-utils';
import {
  KotkaDocumentObjectType,
} from '@kotka/shared/models';
import { Observable, combineLatest } from 'rxjs';
import {
  TransactionPdfSheetsContextService
} from '../+transactions/transaction-pdf-sheets/services/transaction-pdf-sheets-context-service';

enum TypeEnum {
  transactionDispatch = 'transactionDispatch',
  transactionIncoming = 'transactionIncoming',
  transactionInquiry = 'transactionInquiry',
  transactionReturn = 'transactionReturn',
  transactionInsectLabels = 'transactionInsectLabels',
  transactionBotanyLabels = 'transactionBotanyLabels'
}

@Component({
  selector: 'kotka-pdf-demo-component',
  templateUrl: './pdf-demo.component.html',
  styleUrls: ['./pdf-demo.component.scss', '../../assets/pdf-styles.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PdfDemoComponent {
  type$: Observable<TypeEnum>;
  context$: Observable<any>;

  typeEnum = TypeEnum;

  constructor(
    private route: ActivatedRoute,
    private apiClient: ApiClient,
    private transactionPdfSheetsContextService: TransactionPdfSheetsContextService
  ) {
    const params$ = this.route.queryParams.pipe(
      map(({ uri, type }) => ({
        id: FormViewUtils.getIdFromDataURI(uri),
        type: <TypeEnum> (<never> TypeEnum)[type] || TypeEnum.transactionDispatch
      }))
    );

    this.type$ = params$.pipe(map(params => params.type));

    const data$ = params$.pipe(switchMap(params => {
      return this.apiClient.getDocumentById(KotkaDocumentObjectType.transaction, params.id);
    }));

    this.context$ = combineLatest([params$, data$]).pipe(
      switchMap(([ params, data ]) => {
        if (params.type === TypeEnum.transactionInsectLabels) {
          return this.transactionPdfSheetsContextService.getInsectShelfSlipContext(data);
        } else if (params.type === TypeEnum.transactionBotanyLabels) {
          return this.transactionPdfSheetsContextService.getBotanyShelfSlipContext(data);
        }

        return this.transactionPdfSheetsContextService.getSheetContext(data);
      })
    );
  }
}

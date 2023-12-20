import { ChangeDetectionStrategy, Component, ViewEncapsulation, } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { DataService } from '@kotka/services';
import { FormViewUtils } from '../shared-modules/form-view/form-view/form-view-utils';
import {
  asSpecimenTransaction,
  KotkaDocumentObjectType,
} from '@kotka/shared/models';
import { Observable } from 'rxjs';
import {
  DispatchSheetContext,
  TransactionPdfSheetsContextService
} from '../+transactions/transaction-pdf-sheets/transaction-pdf-sheets-context-service';

@Component({
  selector: 'kotka-pdf-demo-component',
  templateUrl: './pdf-demo.component.html',
  styleUrls: ['./pdf-demo.component.scss', '../../assets/pdf-styles.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class PdfDemoComponent {
  context$: Observable<DispatchSheetContext>;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private transactionPdfSheetsContextService: TransactionPdfSheetsContextService
  ) {
    const id$ = this.route.queryParams.pipe(
      map((p) => FormViewUtils.getIdFromDataURI(p['uri']))
    );
    const data$ = id$.pipe(switchMap(id => (
      this.dataService.getById(KotkaDocumentObjectType.transaction, id)
    )));
    this.context$ = data$.pipe(switchMap(data => (
      this.transactionPdfSheetsContextService.getDispatchSheetContext(asSpecimenTransaction(data))
    )));
  }
}

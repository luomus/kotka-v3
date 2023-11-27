import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TransactionDispatchSheetComponent } from './transaction-dispatch-sheet/transaction-dispatch-sheet';
import { ApiClient } from '../../shared/services/api-services/api-client';
import * as FileSaver from 'file-saver';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { ComponentService } from '../../shared/services/component.service';
import { LajiOrganization } from '@kotka/shared/models';

@Component({
  selector: 'kotka-transaction-pdf-sheets',
  template: `
    <button class="btn btn-default" (click)="downloadDispatchSheet()">Dispatch sheet (PDF)</button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionPdfSheetsComponent {
  @Input() data?: SpecimenTransaction;

  constructor(
    private componentService: ComponentService,
    private apiClient: ApiClient
  ) {}

  downloadDispatchSheet() {
    if (!this.data) {
      return;
    }

    this.getOwnerOrganization(this.data).pipe(take(1)).subscribe(organization => {
      const componentRef = this.componentService.createComponentFromType(TransactionDispatchSheetComponent);
      componentRef.instance.data = this.data;
      componentRef.instance.organization = organization;
      componentRef.changeDetectorRef.detectChanges();

      const html = componentRef.location.nativeElement.innerHTML;

      this.apiClient.htmlToPdf(html).subscribe(res => {
        FileSaver.saveAs(res, `dispatchsheet_${this.data?.id}.pdf`);
      });
    });
  }

  getOwnerOrganization(data: SpecimenTransaction): Observable<LajiOrganization> {
    if (!data.owner) {
      throw Error('Transaction is missing an owner');
    }
    return this.apiClient.getOrganization(data.owner);
  }
}

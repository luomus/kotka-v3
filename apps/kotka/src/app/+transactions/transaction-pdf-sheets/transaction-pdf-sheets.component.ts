import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Inject,
  Input,
  Type
} from '@angular/core';
import { TransactionDispatchSheetComponent } from './transaction-dispatch-sheet/transaction-dispatch-sheet';
import * as FileSaver from 'file-saver';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentService } from '../../shared/services/component.service';
import { TransactionPdfSheetBaseComponent } from './transaction-pdf-sheet-base.component';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TransactionPdfSheetsContextService } from './transaction-pdf-sheets-context-service';
import { ApiClient } from '../../shared/services/api-services/api-client';

export interface ComponentWithContext {
  context?: any;
}

@Component({
  selector: 'kotka-transaction-pdf-sheets',
  template: `
    <button class="btn btn-default" (click)="downloadDispatchSheet()">Dispatch sheet (PDF)</button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TransactionPdfSheetsContextService]
})
export class TransactionPdfSheetsComponent {
  @Input() data?: SpecimenTransaction;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private componentService: ComponentService,
    private transactionPdfSheetsContext: TransactionPdfSheetsContextService,
    private apiClient: ApiClient,
    private httpClient: HttpClient
  ) {}

  downloadDispatchSheet() {
    if (!this.data) {
      return;
    }

    this.transactionPdfSheetsContext.getDispatchSheetContext(this.data).subscribe(context => {
      this.downloadSheet(
        TransactionDispatchSheetComponent,
        context,
        `dispatchsheet_${this.data?.id}.pdf`
      );
    });
  }

  private downloadSheet<T extends ComponentWithContext>(componentClass: Type<T>, context: any, fileName: string) {
    this.getHtml(componentClass, context).subscribe(html => {
      this.apiClient.htmlToPdf(html).subscribe(res => {
        FileSaver.saveAs(res, fileName);
      });
    });
  }

  private getHtml<T extends ComponentWithContext>(componentClass: Type<T>, context: any): Observable<string> {
    return this.getStyleElement().pipe(map(styleElem => {
      const baseComponentRef = this.componentService.createComponentFromType(TransactionPdfSheetBaseComponent);

      const head= baseComponentRef.instance.head.nativeElement;
      const body = baseComponentRef.instance.body.nativeElement;

      head.appendChild(styleElem);
      const componentRef = this.addContentComponentToBody(componentClass, context, body);

      const html = baseComponentRef.location.nativeElement.innerHTML;

      baseComponentRef.destroy();
      componentRef.destroy();

      return html;
    }));
  }

  private addContentComponentToBody<T extends ComponentWithContext>(componentClass: Type<T>, context: any, bodyElem: HTMLBodyElement): ComponentRef<T> {
    const componentRef = this.componentService.createComponentFromType(componentClass, bodyElem);

    componentRef.instance.context = context;
    componentRef.changeDetectorRef.detectChanges();

    return componentRef;
  }

  private getStyleElement(): Observable<HTMLStyleElement> {
    return this.getStylesheet().pipe(map(styles => {
      const style = this.document.createElement('style');
      style.innerHTML = styles;
      return style;
    }));
  }

  private getStylesheet(): Observable<string> {
    return this.httpClient.get('/assets/pdf-styles.css', { responseType: 'text' });
  }
}

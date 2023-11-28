import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  Inject,
  Input,
  OnChanges,
  Type,
  ViewEncapsulation
} from '@angular/core';
import { TransactionDispatchSheetComponent } from './transaction-dispatch-sheet/transaction-dispatch-sheet';
import { ApiClient } from '../../shared/services/api-services/api-client';
import * as FileSaver from 'file-saver';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { Observable, of, ReplaySubject, switchMap } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ComponentService } from '../../shared/services/component.service';
import { LajiOrganization } from '@kotka/shared/models';
import { TransactionPdfSheetBaseComponent } from './transaction-pdf-sheet-base.component';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'kotka-transaction-pdf-sheets',
  template: `
    <button class="btn btn-default" (click)="downloadDispatchSheet()">Dispatch sheet (PDF)</button>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class TransactionPdfSheetsComponent implements OnChanges {
  @Input() data?: SpecimenTransaction;

  private ownerSubject = new ReplaySubject<string|undefined>(1);
  private owner$ = this.ownerSubject.asObservable().pipe(take(1));
  ownerOrganization$: Observable<LajiOrganization|undefined>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private componentService: ComponentService,
    private apiClient: ApiClient,
    private httpClient: HttpClient
  ) {
    this.ownerOrganization$ = this.owner$.pipe(
      switchMap(owner => owner ? this.apiClient.getOrganization(owner) : of(undefined))
    );
  }

  ngOnChanges() {
    this.ownerSubject.next(this.data?.owner);
  }

  downloadDispatchSheet() {
    if (!this.data) {
      return;
    }

    this.ownerOrganization$.pipe(take(1)).subscribe(organization => {
      this.downloadSheet(
        TransactionDispatchSheetComponent,
        { data: this.data, organization },
        `dispatchsheet_${this.data?.id}.pdf`
      );
    });
  }

  private downloadSheet<T>(componentClass: Type<T>, state: any, fileName: string) {
    this.getHtml(componentClass, state).subscribe(html => {
      this.apiClient.htmlToPdf(html).subscribe(res => {
        FileSaver.saveAs(res, fileName);
      });
    });
  }

  private getHtml<T>(componentClass: Type<T>, state: any): Observable<string> {
    return this.getStyleElement().pipe(map(styleElem => {
      const baseComponentRef = this.componentService.createComponentFromType(TransactionPdfSheetBaseComponent);

      const head= baseComponentRef.instance.head.nativeElement;
      const body = baseComponentRef.instance.body.nativeElement;

      head.appendChild(styleElem);
      const componentRef = this.addContentComponentToBody(componentClass, state, body);

      const html = baseComponentRef.location.nativeElement.innerHTML;

      baseComponentRef.destroy();
      componentRef.destroy();

      return html;
    }));
  }

  private addContentComponentToBody<T>(componentClass: Type<T>, state: any, bodyElem: HTMLBodyElement): ComponentRef<T> {
    const componentRef = this.componentService.createComponentFromType(componentClass, bodyElem);

    Object.keys((state || {})).forEach(option => {
      (componentRef.instance as any)[option] = state[option];
    });
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

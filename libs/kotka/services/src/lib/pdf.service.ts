import { ComponentRef, Inject, Injectable, Type } from '@angular/core';
import * as FileSaver from 'file-saver';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClient } from './api-client';
import { HttpClient } from '@angular/common/http';
import { ComponentService } from './component.service';
import { PdfBaseComponent } from './components/pdf-base.component';
import { DOCUMENT } from '@angular/common';

export interface ComponentWithContext {
  context?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private apiClient: ApiClient,
    private httpClient: HttpClient,
    private componentService: ComponentService
  ) {}

  downloadSheet<T extends ComponentWithContext>(componentClass: Type<T>, context: unknown, fileName: string): Observable<void> {
    return this.getHtml(componentClass, context).pipe(
      switchMap(html => this.apiClient.htmlToPdf(html)),
      map(res => {
        FileSaver.saveAs(res, fileName);
      })
    );
  }

  private getHtml<T extends ComponentWithContext>(componentClass: Type<T>, context: unknown): Observable<string> {
    return this.getStyleElement().pipe(map(styleElem => {
      const baseComponentRef = this.componentService.createComponentFromType(PdfBaseComponent);

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

  private addContentComponentToBody<T extends ComponentWithContext>(componentClass: Type<T>, context: unknown, bodyElem: HTMLBodyElement): ComponentRef<T> {
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

import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'kotka-transaction-pdf-sheet-base',
  template: `
    <html>
    <head #head>
      <meta charset="utf-8">
      <title>Pdf</title>
      <script type="application/javascript">await document.fonts.ready;</script>
    </head>
    <body #body style="margin: 0; padding: 0;"></body>
    </html>
  `
})
export class TransactionPdfSheetBaseComponent {
  @ViewChild('head', { static: true }) head!: ElementRef<HTMLHeadElement>;
  @ViewChild('body', { static: true }) body!: ElementRef<HTMLBodyElement>;
}

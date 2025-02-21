import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  standalone: true,
  selector: 'kui-pdf-base',
  template: `
    <html>
      <head #head>
        <meta charset="utf-8" />
        <title>Pdf</title>
      </head>
      <body #body></body>
    </html>
  `,
})
export class PdfBaseComponent {
  @ViewChild('head', { static: true }) head!: ElementRef<HTMLHeadElement>;
  @ViewChild('body', { static: true }) body!: ElementRef<HTMLBodyElement>;
}

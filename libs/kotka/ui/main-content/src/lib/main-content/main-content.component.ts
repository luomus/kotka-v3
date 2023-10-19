import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'kui-main-content',
  template: `
    <main [class]="containerClass">
      <div *ngIf="header || _headerTpl" class="pb-2 mt-4 mb-2 border-bottom">
        <h1 *ngIf="header" data-cy="main-header">{{ header }}</h1>
        <ng-container *ngIf="_headerTpl">
          <ng-container *ngTemplateOutlet="_headerTpl"></ng-container>
        </ng-container>
      </div>
      <ng-content></ng-content>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainContentComponent {
  @Input() header?: string;
  @Input() containerClass = 'container-xl';

  _headerTpl?: TemplateRef<Element>;

  @ContentChild('headerTpl', { static: false }) set headerTpl(headerTpl: TemplateRef<Element>|undefined) {
    this._headerTpl = headerTpl;
    this.cdr.markForCheck();
  }

  constructor(
    private cdr: ChangeDetectorRef
  ) {}
}

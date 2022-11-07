import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'kui-main-content',
  template: `
    <main [class]="containerClass">
      <div *ngIf="header" class="pb-2 mt-4 mb-2 border-bottom">
        <h1>{{ header }}</h1>
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
}

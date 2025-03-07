import {
  Component,
  ChangeDetectionStrategy,
  Input,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'kui-main-content',
  template: `
    <main [class]="containerClass">
      <div *ngIf="header || headerTpl" class="pb-2 mt-4 mb-2 border-bottom">
        <h1 *ngIf="header" data-cy="main-header">{{ header }}</h1>
        <ng-container *ngIf="headerTpl">
          <ng-container *ngTemplateOutlet="headerTpl"></ng-container>
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
  imports: [CommonModule]
})
export class MainContentComponent {
  @Input() header?: string;
  @Input() containerClass = 'container-xl';
  @Input() headerTpl?: TemplateRef<unknown>;
}

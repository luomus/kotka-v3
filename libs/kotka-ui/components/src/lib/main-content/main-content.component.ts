import { Component, ChangeDetectionStrategy, TemplateRef, input, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'kui-main-content',
  template: `
    <main [class]="containerClass()" [ngClass]="{ 'with-bottom-margin': hasBottomMargin() }">
      @if (headerTpl() || pageTitle()) {
        <div class="pb-2 mt-4 mb-2 border-bottom">
          @if (headerTpl()) {
            <ng-container *ngTemplateOutlet="headerTpl()!"></ng-container>
          } @else if (pageTitle()) {
            <h1 data-cy="main-header">{{ pageTitle() }}</h1>
          }
        </div>
      }
      <ng-content></ng-content>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .with-bottom-margin {
        margin-bottom: 80px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MainContentComponent {
  private titleService = inject(Title);

  pageTitle = input.required<string>();
  containerClass = input('container-xl');
  headerTpl = input<TemplateRef<unknown>>();
  hasBottomMargin = input(false);

  constructor() {
    effect(() => {
      const titleParts: string[] = [];
      if (this.pageTitle()) {
        titleParts.push(this.pageTitle()!);
      }
      titleParts.push('Kotka');
      this.titleService.setTitle(titleParts.join(' - '));
    });
  }
}

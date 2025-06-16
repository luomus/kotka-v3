import {
  Component,
  ChangeDetectionStrategy,
  TemplateRef,
  input,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'kui-main-content',
  template: `
    <main [class]="containerClass()">
      @if (headerTpl() || title()) {
        <div class="pb-2 mt-4 mb-2 border-bottom">
          @if (headerTpl()) {
            <ng-container *ngTemplateOutlet="headerTpl()!"></ng-container>
          } @else if (title()) {
            <h1 data-cy="main-header">{{ title() }}</h1>
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class MainContentComponent {
  title = input.required<string>();
  containerClass = input('container-xl');
  headerTpl = input<TemplateRef<unknown>>();

  constructor(
    private titleService: Title
  ) {
    effect(() => {
      const titleParts: string[] = [];
      if (this.title()) {
        titleParts.push(this.title()!);
      }
      titleParts.push('Kotka');
      this.titleService.setTitle(titleParts.join(' - '));
    });
  }
}

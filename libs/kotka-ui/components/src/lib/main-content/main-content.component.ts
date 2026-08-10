import { Component, ChangeDetectionStrategy, input, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'kui-main-content',
  template: `
    <main
      [class]="containerClass()"
      [ngClass]="{ 'with-bottom-margin': hasBottomMargin() }"
    >
      <div class="header-container pb-2 mt-4 mb-2 border-bottom">
        <ng-content select="[kuiMainContentHeader]">
          @if (pageTitle()) {
            <h1 data-cy="main-header">{{ pageTitle() }}</h1>
          }
        </ng-content>
      </div>
      <ng-content></ng-content>
    </main>
  `,
  styleUrls: ['./main-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class MainContentComponent {
  private titleService = inject(Title);

  pageTitle = input.required<string>();
  containerClass = input('container-xl');
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

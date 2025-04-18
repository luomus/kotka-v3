import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MainContentComponent } from '@kotka/ui/main-content';

@Component({
  selector: 'kotka-not-found',
  template: `
    <kui-main-content [header]="'Page not found'">
      <p>Please check that you have entered the correct URL.</p>
    </kui-main-content>
  `,
  imports: [MainContentComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {}

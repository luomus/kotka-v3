import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'kotka-not-found',
  template: `
    <p>
      Not found!
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundComponent {


}

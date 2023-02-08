import { Component } from '@angular/core';

@Component({
  selector: 'kotka-base',
  template: `
    <kotka-nav></kotka-nav>
    <router-outlet></router-outlet>
    <kotka-toaster></kotka-toaster>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class BaseComponent {}

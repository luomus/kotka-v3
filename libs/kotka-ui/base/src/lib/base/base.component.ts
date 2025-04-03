import { Component } from '@angular/core';
import { NavComponent } from '../nav/nav.component';
import { RouterOutlet } from '@angular/router';
import { ToasterComponent } from '../toaster/toaster.component';

@Component({
  selector: 'kotka-base',
  template: `
    <kotka-nav></kotka-nav>
    <router-outlet></router-outlet>
    <kotka-toaster></kotka-toaster>
  `,
  imports: [NavComponent, RouterOutlet, ToasterComponent],
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class BaseComponent {}

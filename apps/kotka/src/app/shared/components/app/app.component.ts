import { Component } from '@angular/core';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'kotka-root',
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  constructor(
    private titleService: TitleService
  ) {
    this.titleService.startRouteListener();
  }
}

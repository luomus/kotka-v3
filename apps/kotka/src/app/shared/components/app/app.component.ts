import { Component } from '@angular/core';
import { TitleService } from '@kotka/ui/util-services';

@Component({
  selector: 'kotka-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
})
export class AppComponent {
  constructor(private titleService: TitleService) {
    this.titleService.startRouteListener();
  }
}

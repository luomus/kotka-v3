import { Component } from '@angular/core';
import { TitleService } from '@kotka/ui/services';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'kotka-root',
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  imports: [RouterOutlet],
})
export class AppComponent {
  constructor(private titleService: TitleService) {
    this.titleService.startRouteListener();
  }
}

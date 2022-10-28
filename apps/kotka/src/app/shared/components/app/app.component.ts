import { Component } from '@angular/core';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'kotka-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private titleService: TitleService
  ) {
    this.titleService.startRouteListener();
  }
}

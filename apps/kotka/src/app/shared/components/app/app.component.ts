import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@kotka/api-interfaces';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'kotka-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'kotka';
  hello$ = this.http.get<Message>('/api/hello');

  constructor(
    private titleService: TitleService,
    private http: HttpClient
  ) {
    this.titleService.startRouteListener();
  }
}

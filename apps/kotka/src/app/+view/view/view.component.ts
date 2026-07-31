import {
  Component,
  inject
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { SpecimenViewerComponent } from '../specimen-viewer/specimen-viewer.component';
import { AsyncPipe } from '@angular/common';
import { NotFoundComponent } from '@kotka/ui/base';

@Component({
  selector: 'kotka-view',
  templateUrl: './view.component.html',
  imports: [SpecimenViewerComponent, AsyncPipe, NotFoundComponent],
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent {
  private route = inject(ActivatedRoute);

  uri$ = this.route.queryParams.pipe(map((params) => params['uri']));
}

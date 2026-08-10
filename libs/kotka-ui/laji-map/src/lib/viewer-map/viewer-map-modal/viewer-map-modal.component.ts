import { Component, signal } from '@angular/core';
import { DataOptions, Options } from '@luomus/laji-map';
import { LajiMapComponent } from '../../laji-map/laji-map.component';
import { ModalComponent } from '@kotka/ui/components';

@Component({
  selector: 'kui-viewer-map-modal',
  templateUrl: './viewer-map-modal.component.html',
  styleUrls: ['./viewer-map-modal.component.scss'],
  imports: [LajiMapComponent, ModalComponent],
})
export class ViewerMapModalComponent {
  data = signal<DataOptions | undefined>(undefined);
  options = signal<Options | undefined>(undefined);
}

import {
  Component,
  input,
  OnDestroy,
  Signal,
  computed,
  inject,
} from '@angular/core';
import { DataOptions, Options, TileLayerName } from '@luomus/laji-map';
import { LajiMapComponent } from '../laji-map/laji-map.component';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ViewerMapModalComponent } from './viewer-map-modal/viewer-map-modal.component';

@Component({
  selector: 'kui-viewer-map',
  imports: [LajiMapComponent],
  template:
    '<kui-laji-map [data]="data()" [options]="activeOptions()" (click)="openModal()"></kui-laji-map>',
  styleUrls: ['./viewer-map.component.scss'],
})
export class ViewerMapComponent implements OnDestroy {
  data = input<DataOptions>();
  options = input<Options>();
  modalMapOptions = input<Options>();

  activeOptions: Signal<Options>;
  activeModalMapOptions: Signal<Options>;

  private defaultOptions: Options = {
    tileLayerName: TileLayerName.openStreetMap,
    zoom: -3,
    center: [0, 0],
    viewLocked: true,
  };
  private defaultModalMapOptions: Options = {
    tileLayerName: TileLayerName.openStreetMap,
    zoomToData: { maxZoom: 4 },
    controls: {
      location: false,
      geocoding: false
    } as any, // TODO remove any after laji-map type fixed
  };

  private modalService = inject(NgbModal);
  private modalRef?: NgbModalRef;

  constructor() {
    this.activeOptions = computed(() => {
      return { ...this.defaultOptions, ...this.options() };
    });
    this.activeModalMapOptions = computed(() => {
      return { ...this.defaultModalMapOptions, ...this.modalMapOptions() };
    });
  }

  openModal() {
    this.modalRef = this.modalService.open(ViewerMapModalComponent, {
      size: 'md',
      windowClass: 'd-flex',
      modalDialogClass: 'd-flex w-100',
    });
    this.modalRef.componentInstance.data.set(this.data());
    this.modalRef.componentInstance.options.set(this.activeModalMapOptions());
  }

  ngOnDestroy() {
    this.modalRef?.close();
  }
}

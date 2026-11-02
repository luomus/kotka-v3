import {
  ChangeDetectionStrategy,
  Component, computed,
  inject,
  model,
  Signal,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { isCircleFeature, LajiMapComponent } from '@kotka/ui/laji-map';
import { ModalComponent, ModalFooterDirective, ModalHeaderDirective } from '@kotka/ui/components';
import { DataOptions, Options, TileLayerName, LajiMapEvent } from '@luomus/laji-map';
import { Feature } from 'geojson';
import { LocationFilter } from '../models/models';

@Component({
  selector: 'kotka-location-filter-modal',
  template: `
    <kui-modal bodyClass="d-flex flex-column">
      <h2 kuiModalHeader>Filter by Location</h2>
      <p>
        Click the button on the top right corner to start drawing the area on the map.
      </p>
      <kui-laji-map
        [data]="data()"
        [options]="options"
        (drawEvent)="onDrawEvent($event)"
      ></kui-laji-map>
      <ng-container kuiModalFooter>
        <button class="btn btn-primary" (click)="onConfirmClick()">OK</button>
        <button class="btn btn-outline-secondary" (click)="modal.dismiss()">
          Cancel
        </button>
      </ng-container>
    </kui-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LajiMapComponent,
    ModalComponent,
    ModalFooterDirective,
    ModalHeaderDirective,
  ],
  styles: `
    :host,
    kui-modal {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    kui-laji-map {
      flex: 1 1 auto;
    }
  `,
})
export class LocationFilterModalComponent {
  modal = inject(NgbActiveModal);

  locationFilter = model<LocationFilter>();

  data: Signal<DataOptions | undefined>;

  options: Options = {
    tileLayerName: TileLayerName.openStreetMap,
    controls: {
      location: false,
      geocoding: false,
      draw: {
        undo: false,
        redo: false,
      },
    },
    draw: {
      rectangle: false,
      polygon: false,
      polyline: false,
      marker: false,
    },
  };

  constructor() {
    this.data = computed(() => {
      const filter = this.locationFilter();
      if (!filter) {
        return undefined;
      }

      return {
        geoData: {
          type: 'Point',
          coordinates: [filter.longitude, filter.latitude],
          radius: filter.radius,
        },
        editable: true,
      };
    });
  }

  onDrawEvent(data: LajiMapEvent[]) {
    for (const event of data) {
      let feature: Feature | undefined = undefined;
      if (event.type === 'create') {
        feature = event.feature;
      } else if (event.type === 'edit') {
        feature = event.features[0];
      }

      if (feature && isCircleFeature(feature)) {
        this.locationFilter.set({
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          radius: feature.geometry.radius,
        });
      } else {
        this.locationFilter.set(undefined);
      }
    }
  }

  onConfirmClick() {
    this.modal.close(this.locationFilter());
  }
}

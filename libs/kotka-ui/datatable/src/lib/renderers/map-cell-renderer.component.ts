import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CellRendererComponent } from './cell-renderer';
import { ViewerMapComponent } from '@kotka/ui/laji-map';
import { DataOptions, Options } from '@luomus/laji-map';

@Component({
  selector: 'kui-map-cell-renderer',
  template: `
    @if (mapData) {
      <kui-viewer-map
        [data]="mapData"
        [options]="mapOptions"
      ></kui-viewer-map>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 98px;
      padding-top: 4px;
      padding-bottom: 5px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ViewerMapComponent],
})
export class MapCellRendererComponent extends CellRendererComponent {
  mapData?: DataOptions;
  mapOptions?: Options;

  override paramsChange() {
    const lat = this.params.value?.lat;
    const lon = this.params.value?.lon;

    if (lat === undefined || lon === undefined) {
      this.mapData = undefined;
      return;
    }

    this.mapData = {
      geoData: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      getFeatureStyle: () => ({}),
    };
    this.mapOptions = {
      zoom: -3,
      center: [lat + 4, lon]
    };
  }

  static override getExportValue(value: any): string {
    const lat = value?.lat;
    const lon = value?.lon;

    if (lat === undefined || lon === undefined) {
      return '';
    }

    return `${lat}; ${lon}`;
  }

  static override getMinimumRowHeight(): number {
    return 100;
  }
}

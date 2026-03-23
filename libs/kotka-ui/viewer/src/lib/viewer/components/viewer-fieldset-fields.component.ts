import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  Signal,
} from '@angular/core';
import {
  DifferenceObject,
  isPatch,
  LajiForm,
  MediaTypes,
  Patch,
} from '@kotka/shared/models';
import { ViewerFieldsetFieldComponent } from './viewer-fieldset-field.component';
import { LajiMapComponent } from '@kotka/ui/laji-map';
import { DataOptions, Options, TileLayerName } from '@luomus/laji-map';
import { Feature } from 'geojson';
import { GetFeatureStyleOptions } from '@luomus/laji-map/lib/map.defs';
import { PathOptions } from 'leaflet';
import { ImageGalleryComponent } from '@kotka/ui/components';
import { ApiClient } from '@kotka/ui/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { Image } from '@luomus/laji-schema';

interface ViewModel {
  fields: LajiForm.Field[];
  data?: any;
  differenceData?: DifferenceObject;
  mapData?: DataOptions;
  imageIds?: string[];
}

type FeatureDifferenceState = 'current' | 'added' | 'removed';

@Component({
  selector: 'kui-viewer-fieldset-fields',
  template: `
    @if (images().length) {
      <kui-image-gallery [images]="images()"></kui-image-gallery>
    }
    @if (vm().mapData) {
      <kui-laji-map [data]="vm().mapData" [options]="mapOptions"></kui-laji-map>
    }
    @for (field of vm().fields; track field) {
      <kui-viewer-fieldset-field
        [field]="field"
        [data]="vm().data?.[field.name || '']"
        [differenceData]="vm().differenceData?.[field.name || '']"
      ></kui-viewer-fieldset-field>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ViewerFieldsetFieldComponent,
    LajiMapComponent,
    LajiMapComponent,
    ImageGalleryComponent,
  ],
})
export class ViewerFieldsetFieldsComponent {
  private apiClient = inject(ApiClient);

  fields = input<LajiForm.Field[]>([]);
  data = input<any>();
  differenceData = input<DifferenceObject>();

  vm: Signal<ViewModel> = computed(() => {
    const fields = this.fields().filter(
      (field) =>
        !['wgs84Longitude', 'wgs84Latitude', 'images'].includes(field.name),
    );

    return {
      fields,
      data: this.data(),
      differenceData: this.differenceData(),
      mapData: this.getMapGeometry(this.data(), this.differenceData()),
      imageIds: this.data()?.images,
    };
  });

  images: Signal<Image[]> = toSignal(
    toObservable(this.vm).pipe(
      switchMap((vm) =>
        vm.imageIds?.length
          ? this.apiClient.getMediaByIds(MediaTypes.images, vm.imageIds)
          : of([]),
      ),
    ),
    { initialValue: [] },
  );

  mapOptions: Options = {
    tileLayerName: TileLayerName.openStreetMap,
    zoom: -3,
    center: [0, 0],
    viewLocked: true,
  };

  private getMapGeometry(
    data: any,
    differenceData: DifferenceObject | undefined,
  ): DataOptions | undefined {
    const { wgs84Longitude, wgs84Latitude } = data || {};

    const lngPatch = isPatch(differenceData?.['wgs84Longitude'])
      ? differenceData?.['wgs84Longitude']
      : undefined;
    const latPatch = isPatch(differenceData?.['wgs84Latitude'])
      ? differenceData?.['wgs84Latitude']
      : undefined;

    const features: Feature[] = [];

    const removedOrCurrentFeature = this.getRemovedOrCurrentFeature(
      wgs84Longitude,
      wgs84Latitude,
      lngPatch,
      latPatch,
    );
    if (removedOrCurrentFeature) {
      features.push(removedOrCurrentFeature);
    }

    const addedFeature = this.getAddedFeature(
      wgs84Longitude,
      wgs84Latitude,
      lngPatch,
      latPatch,
    );
    if (addedFeature) {
      features.push(addedFeature);
    }

    if (features.length === 0) {
      return undefined;
    }

    return {
      featureCollection: { type: 'FeatureCollection', features },
      getFeatureStyle: this.getFeatureStyle,
    };
  }

  private getRemovedOrCurrentFeature(
    lng: string | number | undefined,
    lat: string | number | undefined,
    lngPatch: Patch | undefined,
    latPatch: Patch | undefined,
  ): Feature | undefined {
    if (!lng || !lat) {
      return undefined;
    }

    const isRemoved = [lngPatch?.op, latPatch?.op].some(
      (op) => op === 'remove' || op === 'replace',
    );

    return this.getPointFeature(lng, lat, isRemoved ? 'removed' : 'current');
  }

  private getAddedFeature(
    lng: string | number | undefined,
    lat: string | number | undefined,
    lngPatch: Patch | undefined,
    latPatch: Patch | undefined,
  ): Feature | undefined {
    const isAddOrReplace = (op?: string) => op === 'add' || op === 'replace';

    if (
      !(lngPatch && isAddOrReplace(lngPatch.op)) &&
      !(latPatch && isAddOrReplace(latPatch.op))
    ) {
      return undefined;
    }

    const newLng = isAddOrReplace(lngPatch?.op) ? lngPatch.value : lng;
    const newLat = isAddOrReplace(latPatch?.op) ? latPatch.value : lat;

    if (!newLng || !newLat) {
      return undefined;
    }

    return this.getPointFeature(newLng, newLat, 'added');
  }

  private getPointFeature(
    lng: string | number,
    lat: string | number,
    differenceState: FeatureDifferenceState,
  ): Feature {
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [+lng, +lat] },
      properties: { differenceState },
    };
  }

  private getFeatureStyle(data: GetFeatureStyleOptions): PathOptions {
    const differenceState: FeatureDifferenceState | undefined =
      data.feature?.properties?.['differenceState'];

    if (differenceState === 'added') {
      return { color: 'rgba(37, 200, 124)' };
    } else if (differenceState === 'removed') {
      return { color: 'rgba(231, 118, 129)' };
    }

    return {};
  }
}

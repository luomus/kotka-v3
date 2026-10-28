import {
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  viewChild,
  effect,
  OnDestroy,
  output,
  Signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Logger } from '@kotka/ui/core';
import { DataOptions, Options, Lang, LajiMapEvent } from '@luomus/laji-map';

@Component({
  selector: 'kui-laji-map',
  imports: [],
  template: '<div #lajiMap class="laji-map"></div>',
  styleUrls: ['./laji-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LajiMapComponent implements OnDestroy {
  private zone = inject(NgZone);
  private logger = inject(Logger);

  data = input<DataOptions>();
  options = input<Options>();

  drawEvent = output<LajiMapEvent[]>();

  elemRef = viewChild<ElementRef<HTMLDivElement>>('lajiMap');

  private mapOptions: Signal<Options | undefined>;
  private map: any;

  constructor() {
    this.mapOptions = computed(() => {
      const elem = this.elemRef();
      if (!elem) {
        return undefined;
      }

      const options = {
        ...this.options(),
        draw: {
          ...this.options()?.draw,
          onChange: this.onDrawChange.bind(this),
        },
      };

      return {
        lang: Lang.en,
        rootElem: elem.nativeElement,
        data: this.data(),
        ...options,
      };
    });

    effect(() => {
      const mapOptions = this.mapOptions();
      if (!mapOptions) {
        return;
      }

      if (this.map) {
        this.zone.run(() => {
          this.map.setOptions(mapOptions);
        });
      } else {
        this.initMap(mapOptions);
      }
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      this.map?.destroy();
    });
  }

  initMap(mapOptions: Options) {
    import('@luomus/laji-map').then(({ LajiMap }) => {
      this.zone.runOutsideAngular(() => {
        this.map?.destroy();

        try {
          this.map = new LajiMap(mapOptions);
        } catch (e) {
          this.logger.error('Map initialization failed', e);
        }
      });
    });
  }

  private onDrawChange(data: LajiMapEvent[]) {
    this.zone.run(() => {
      this.drawEvent.emit(data);
    });
  }
}

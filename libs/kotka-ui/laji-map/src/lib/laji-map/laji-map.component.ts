import {
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  viewChild,
  effect,
  OnDestroy,
} from '@angular/core';
import { Logger } from '@kotka/ui/core';
import { DataOptions, Options } from '@luomus/laji-map';

@Component({
  selector: 'kui-laji-map',
  imports: [],
  template: '<div #lajiMap class="laji-map"></div>',
  styleUrls: ['./laji-map.component.scss'],
})
export class LajiMapComponent implements OnDestroy {
  private zone = inject(NgZone);
  private logger = inject(Logger);

  data = input<DataOptions>();
  options = input<Options>();

  elemRef = viewChild<ElementRef<HTMLDivElement>>('lajiMap');

  private map: any;

  constructor() {
    effect(() => {
      const elem = this.elemRef();
      const data = this.data();
      const options = this.options();

      if (!elem) {
        return;
      }

      this.initMap(elem, data, options);
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      this.map?.destroy();
    });
  }

  initMap(elem: ElementRef, data?: DataOptions, options?: Options) {
    import('@luomus/laji-map').then(({ LajiMap }) => {
      this.zone.runOutsideAngular(() => {
        this.map?.destroy();

        const mapOptions: any = {
          lang: 'en',
          rootElem: elem.nativeElement,
          data,
          ...options,
        };
        try {
          this.map = new LajiMap(mapOptions);
        } catch (e) {
          this.logger.error('Map initialization failed', e);
        }
      });
    });
  }
}

import {
  Component,
  ElementRef,
  OnDestroy,
  inject,
  signal,
  viewChild,
  computed,
  Signal,
  OnInit,
  NgZone,
  HostListener,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Image } from '@luomus/laji-schema';
import OpenSeadragon from 'openseadragon';
import { EnumPipe, FormService, GLOBALS, WINDOW } from '@kotka/ui/core';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'kui-image-viewer-modal',
  templateUrl: './image-viewer-modal.component.html',
  styleUrls: ['./image-viewer-modal.component.scss'],
  imports: [EnumPipe],
})
export class ImageViewerModalComponent implements OnInit, OnDestroy {
  private window = inject(WINDOW);
  private globals = inject(GLOBALS);

  private modal = inject(NgbActiveModal);
  private zone = inject(NgZone);
  private formService = inject(FormService);

  images = signal<Image[]>([]);
  currentIndex = signal(0);

  currentImage: Signal<Image | undefined>;

  imageMetadataForm = toSignal(
    this.formService.getFieldData(this.globals.imageMetadataFormId),
  );

  private viewer: OpenSeadragon.Viewer | null = null;
  private osdContainer = viewChild<ElementRef<HTMLDivElement>>('osdContainer');

  constructor() {
    this.currentImage = computed(() => this.images()[this.currentIndex()]);
  }

  ngOnInit() {
    this.initViewer();
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      this.viewer?.destroy();
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.resizeContainer();
  }

  prev() {
    const newIndex =
      this.currentIndex() <= 0
        ? this.images().length - 1
        : this.currentIndex() - 1;
    this.currentIndex.set(newIndex);
    this.openImage();
  }

  next() {
    const newIndex =
      this.currentIndex() >= this.images().length - 1
        ? 0
        : this.currentIndex() + 1;
    this.currentIndex.set(newIndex);
    this.openImage();
  }

  zoomIn() {
    this.zone.runOutsideAngular(() => {
      if (this.viewer?.viewport) {
        const zoom = this.viewer.viewport.getZoom();
        this.viewer.viewport.zoomTo(zoom * 1.5);
      }
    });
  }

  zoomOut() {
    this.zone.runOutsideAngular(() => {
      if (this.viewer?.viewport) {
        const zoom = this.viewer.viewport.getZoom();
        this.viewer.viewport.zoomTo(zoom / 1.5);
      }
    });
  }

  resetZoom() {
    this.zone.runOutsideAngular(() => {
      this.viewer?.viewport?.goHome();
    });
  }

  close() {
    this.modal.dismiss();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.modal.dismiss();
    }
  }

  onKeydown(event: KeyboardEvent) {
    const activeElement = document.activeElement;
    const osdCanvasActive = activeElement?.classList?.contains(
      'openseadragon-canvas',
    );

    switch (event.key) {
      case 'ArrowLeft':
        if (!osdCanvasActive) {
          this.prev();
          event.preventDefault();
        }
        break;
      case 'ArrowRight':
        if (!osdCanvasActive) {
          this.next();
          event.preventDefault();
        }
        break;
      case 'Escape':
        this.modal.dismiss();
        event.preventDefault();
        break;
    }
  }

  private initViewer() {
    const container = this.osdContainer()?.nativeElement;
    if (!container) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.viewer = new OpenSeadragon.Viewer({
        element: container,
        prefixUrl: '',
        drawer: 'canvas',
        showNavigationControl: false,
        showNavigator: true,
        navigatorPosition: 'BOTTOM_RIGHT',
        visibilityRatio: 1,
        minZoomImageRatio: 0.8,
        maxZoomPixelRatio: 4,
        constrainDuringPan: true,
        animationTime: 0.3,
        gestureSettingsMouse: {
          scrollToZoom: true,
          clickToZoom: true,
          dblClickToZoom: true,
        },
        gestureSettingsTouch: {
          pinchToZoom: true,
          clickToZoom: false,
          dblClickToZoom: true,
        },
      });

      this.viewer?.world.addHandler('add-item', (event) => {
        event.item.addOnceHandler('fully-loaded-change', () => {
          this.resizeContainer();
          this.viewer?.addOnceHandler(
            'viewport-change',
            this.resetZoom.bind(this),
          );
        });
      });

      this.openImage();
    });
  }

  private openImage() {
    this.zone.runOutsideAngular(() => {
      if (!this.viewer) {
        return;
      }

      this.viewer.close();

      const image = this.currentImage();
      if (!image) {
        return;
      }

      this.viewer.addSimpleImage({ url: image.fullURL });
    });
  }

  private resizeContainer() {
    this.zone.runOutsideAngular(() => {
      const item = this.viewer?.world.getItemAt(0);
      const osdContainer = this.osdContainer()?.nativeElement;
      if (!item || !osdContainer) {
        return;
      }

      const { width: maxWidth, height: maxHeight } =
        this.getContentWidthAndHeight(osdContainer.parentElement);

      const nativeSize = item.getContentSize();

      const scale = Math.min(
        1,
        maxWidth / nativeSize.x,
        maxHeight / nativeSize.y,
      );

      const targetWidth = Math.round(nativeSize.x * scale);
      const targetHeight = Math.round(nativeSize.y * scale);

      osdContainer.style.width = `${targetWidth}px`;
      osdContainer.style.height = `${targetHeight}px`;
    });
  }

  private getContentWidthAndHeight(element: HTMLElement | null): {
    width: number;
    height: number;
  } {
    if (!element) {
      return { width: 0, height: 0 };
    }

    const widthWithPaddings = element.clientWidth;
    const heightWithPaddings = element.clientHeight;
    const elementComputedStyle = this.window.getComputedStyle(element, null);

    return {
      width:
        widthWithPaddings -
        parseFloat(elementComputedStyle.paddingLeft) -
        parseFloat(elementComputedStyle.paddingRight),
      height:
        heightWithPaddings -
        parseFloat(elementComputedStyle.paddingTop) -
        parseFloat(elementComputedStyle.paddingBottom),
    };
  }
}

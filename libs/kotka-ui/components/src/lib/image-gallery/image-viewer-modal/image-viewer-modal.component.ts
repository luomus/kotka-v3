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
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Image } from '@luomus/laji-schema';
import OpenSeadragon from 'openseadragon';

@Component({
  selector: 'kui-image-viewer-modal',
  templateUrl: './image-viewer-modal.component.html',
  styleUrls: ['./image-viewer-modal.component.scss'],
  imports: [],
})
export class ImageViewerModalComponent implements OnInit, OnDestroy {
  private modal = inject(NgbActiveModal);

  images = signal<Image[]>([]);
  currentIndex = signal(0);

  currentImage: Signal<Image | undefined>;

  private viewer: OpenSeadragon.Viewer | null = null;
  private osdContainer = viewChild<ElementRef<HTMLDivElement>>('osdContainer');

  constructor() {
    this.currentImage = computed(() => this.images()[this.currentIndex()]);
  }

  ngOnInit() {
    this.initViewer();
  }

  ngOnDestroy() {
    this.viewer?.destroy();
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
    if (this.viewer?.viewport) {
      const zoom = this.viewer.viewport.getZoom();
      this.viewer.viewport.zoomTo(zoom * 1.5);
    }
  }

  zoomOut() {
    if (this.viewer?.viewport) {
      const zoom = this.viewer.viewport.getZoom();
      this.viewer.viewport.zoomTo(zoom / 1.5);
    }
  }

  resetZoom() {
    this.viewer?.viewport?.goHome();
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
    const osdCanvasActive = activeElement?.classList?.contains('openseadragon-canvas');

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

    this.openImage();
  }

  private openImage() {
    if (!this.viewer) {
      return;
    }

    this.viewer.close();

    const image = this.currentImage();
    if (!image) {
      return;
    }

    this.viewer.addSimpleImage({ url: image.fullURL });
  }
}

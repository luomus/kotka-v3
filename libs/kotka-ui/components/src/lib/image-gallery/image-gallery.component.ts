import { Component, inject, input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ImageViewerModalComponent } from './image-viewer-modal/image-viewer-modal.component';
import { Image } from '@luomus/laji-schema';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'kui-image-gallery',
  templateUrl: './image-gallery.component.html',
  imports: [NgOptimizedImage],
  styleUrls: ['./image-gallery.component.scss'],
})
export class ImageGalleryComponent {
  images = input<Image[]>([]);

  private modalService = inject(NgbModal);

  openViewer(index: number) {
    const modalRef = this.modalService.open(ImageViewerModalComponent, {
      fullscreen: true,
      windowClass: 'semi-transparent-modal',
      backdrop: false,
    });

    modalRef.componentInstance.images.set(this.images());
    modalRef.componentInstance.currentIndex.set(index);
  }
}

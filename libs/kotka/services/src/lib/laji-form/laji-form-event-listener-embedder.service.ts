import {
  Inject,
  Injectable
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface EventListenerData {
  id: string;
  func: (event: MouseEvent) => void;
  event: 'onclick';
  elem?: HTMLElement|null;
}

@Injectable({
  providedIn: 'root'
})
export class LajiFormEventListenerEmbedderService {
  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {}

  addOnClickEventListener(id: string, func: (event: MouseEvent) => void): EventListenerData {
    const data: EventListenerData = { id, func, event: 'onclick' };
    this.addEventListener(data);
    return data;
  }

  updateAfterDomChange(data: EventListenerData) {
    if (data.elem && this.document.body.contains(data.elem)) {
      return;
    }
    this.addEventListener(data);
  }

  private addEventListener(data: EventListenerData) {
    const elem: HTMLElement|null = this.document.getElementById(data.id);
    data.elem = elem;

    if (elem) {
      elem[data.event] = data.func;
    }
  }
}

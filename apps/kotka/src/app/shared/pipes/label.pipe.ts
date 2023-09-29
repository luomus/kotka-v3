import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { LabelService } from '../services/api-services/label.service';

@Pipe({
  name: 'label',
  pure: false
})
export class LabelPipe implements PipeTransform {
  value: string|string[] = '';
  lastId?: string|string[];

  constructor(
    private labelService: LabelService,
    private cdr: ChangeDetectorRef
  ) {}

  transform(value?: string): string;
  transform(value?: string[]): string[];
  transform(value?: string|string[]): string|string[] {
    if (!value || value.length === 0) {
      return '';
    }

    if (value === this.lastId) {
      return this.value;
    }

    this.lastId = value;

    this.updateValue(value);
    return this.value;
  }

  private updateValue(id: string|string[]): void {
    const label$: Observable<string|string[]> = Array.isArray(id) ?
      forkJoin(id.map(_id => this.labelService.getLabel(_id))) :
      this.labelService.getLabel(id);

    label$.subscribe(label => {
      this.value = label;
      this.cdr.markForCheck();
    });
  }
}

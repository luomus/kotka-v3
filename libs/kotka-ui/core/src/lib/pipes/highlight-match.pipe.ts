import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightMatch',
  pure: true,
})
export class HighlightMatchPipe implements PipeTransform {
  transform(value: string, match: string): string {
    const trimmedMatch = (match ?? '').trim();

    if (!trimmedMatch) {
      return this.escapeHtml(value);
    }

    const index = value.toLowerCase().indexOf(trimmedMatch.toLowerCase());
    if (index === -1) {
      return this.escapeHtml(value);
    }

    return (
      this.escapeHtml(value.slice(0, index)) +
      '<b>' +
      this.escapeHtml(value.slice(index, index + trimmedMatch.length)) +
      '</b>' +
      this.escapeHtml(value.slice(index + trimmedMatch.length))
    );
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

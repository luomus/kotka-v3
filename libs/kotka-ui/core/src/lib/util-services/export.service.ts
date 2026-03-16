import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import { utils, write } from 'xlsx';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private xlsxMimeType =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  export(aoa: string[][], filename: string): Observable<void> {
    return of(aoa).pipe(
      map((data) => this.getBufferFromAoa(data)),
      map((buffer) => this.exportArrayBuffer(buffer, filename)),
    );
  }

  private getBufferFromAoa(aoa: string[][]): any {
    const sheet = utils.aoa_to_sheet(aoa);
    sheet['!cols'] = this.getColsData(aoa);

    const book = utils.book_new();
    utils.book_append_sheet(book, sheet);

    return write(book, { bookType: 'xlsx', type: 'array' });
  }

  private getColsData(aoa: string[][]) {
    // get maximum character of each column
    return aoa[0].map((a, i) => ({
      wch: Math.max(...aoa.map((a2) => a2[i].length)),
    }));
  }

  private exportArrayBuffer(buffer: any, fileName: string) {
    const data: Blob = this.createBlob(buffer);
    this.saveBlob(data, fileName);
  }

  private createBlob(buffer: any): Blob {
    return new Blob([buffer], {
      type: this.xlsxMimeType,
    });
  }

  private saveBlob(data: Blob, fileName: string) {
    FileSaver.saveAs(data, fileName + '.xlsx');
  }
}

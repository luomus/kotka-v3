import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import {
  URICellRendererComponent,
  DatatableColumn
} from '@kotka/ui/datatable';
import { DocumentDatatableComponent } from '@kotka/ui/document-datatable';
import { KotkaDocumentObjectType } from '@kotka/shared/models';
import { MainContentComponent } from '@kotka/ui/main-content';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'kotka-specimen-table',
  templateUrl: './specimen-table.component.html',
  styleUrls: ['./specimen-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MainContentComponent, FormsModule, DocumentDatatableComponent],
})
export class SpecimenTableComponent{
  dataType = KotkaDocumentObjectType.specimen;

  columns: DatatableColumn[] = [
    {
      headerName: 'URI',
      field: 'id',
      cellRenderer: URICellRendererComponent,
      cellRendererParams: {
        routerLink: ['..', 'edit']
      },
      width: 145,
      flex: 0,
      lockPosition: 'left',
      defaultSelected: true
    }
  ];
}

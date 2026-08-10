import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LabelPipe } from '@kotka/ui/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { Document, SpecimenDataType } from '@kotka/shared/models';

@Component({
  selector: 'kotka-specimen-viewer-header',
  templateUrl: './specimen-viewer-header.component.html',
  styleUrls: ['./specimen-viewer-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgbPopover, LabelPipe, DatePipe],
})
export class SpecimenViewerHeaderComponent {
  uri = input.required<string>();
  pageTitle = input.required<string>();
  specimenDataType = input<SpecimenDataType | string>();
  document = input<Document>();
  showEditButton = input<boolean>(false);
  showBranchesLink = input<boolean>(true);
}


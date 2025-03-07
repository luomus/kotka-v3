import { Component, Input, OnChanges } from '@angular/core';
import { SpecimenTransaction } from '@luomus/laji-schema';
import { CommonModule } from '@angular/common';
import { TransactionTypeLabelPipe } from '../../pipes/transaction-type-label.pipe';

type SpecimenIdField = keyof Pick<
  SpecimenTransaction,
  'awayIDs' | 'returnedIDs' | 'missingIDs'
>;
type SpecimenCountField = keyof Pick<
  SpecimenTransaction,
  'awayCount' | 'returnedCount' | 'missingCount'
>;

@Component({
  imports: [CommonModule, TransactionTypeLabelPipe],
  selector: 'kotka-transaction-sheet-material',
  templateUrl: './transaction-sheet-material.html',
})
export class TransactionSheetMaterialComponent implements OnChanges {
  @Input({ required: true }) data!: SpecimenTransaction;

  originalTotalCount = 0;
  originalCountWithIds = 0;
  originalCountWithoutIds = 0;

  awayTotalCount = 0;

  allSpecimens: string[] = [];

  ngOnChanges() {
    this.originalTotalCount = 0;
    this.originalCountWithIds = 0;
    this.originalCountWithoutIds = 0;
    this.awayTotalCount = 0;
    this.allSpecimens = [];

    const specimenIdFields: SpecimenIdField[] = [
      'awayIDs',
      'returnedIDs',
      'missingIDs',
    ];
    const specimenCountFields: SpecimenCountField[] = [
      'awayCount',
      'returnedCount',
      'missingCount',
    ];

    specimenIdFields.forEach((field) => {
      const value = (this.data[field] || []).length;
      this.originalCountWithIds += value;
      this.originalTotalCount += value;
      if (field === 'awayIDs') {
        this.awayTotalCount += value;
      }
      this.allSpecimens = this.allSpecimens.concat(this.data[field] || []);
    });

    specimenCountFields.forEach((field) => {
      const value = this.data[field] || 0;
      this.originalCountWithoutIds += value;
      this.originalTotalCount += value;
      if (field === 'awayCount') {
        this.awayTotalCount += value;
      }
    });
  }
}

/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Document, MYRecordBases, Unit } from '@kotka/shared/models';

const DELIMITER = ';';

const recordBasisMapping: Record<'associatedObservationTaxa' | 'associatedSpecimenTaxa', MYRecordBases> = {
  'associatedObservationTaxa': 'MY.recordBasisHumanObservation',
  'associatedSpecimenTaxa': 'MY.recordBasisPreservedSpecimen',
};

@Injectable()
export class AssociatedTaxaToUnitInterceptor implements NestInterceptor {

  intercept(context: ExecutionContext, next: CallHandler): Observable<Document> {
    const req = context.switchToHttp().getRequest();
    const body: Document = req.body;

    if (!((req.method === 'POST' && !req.path?.includes('_search')) || req.method === 'PUT')) {
      return next.handle();
    }

    const { associatedObservationTaxa, associatedSpecimenTaxa, ...gathering } = body.gatherings?.[0] || {};

    const newUnits: Unit[] = [];

    if (associatedObservationTaxa) {
      const taxa = associatedObservationTaxa.split(DELIMITER).map(taxon => taxon.trim()).filter(taxon => taxon.length > 0);

      this.createNewUnits(taxa, recordBasisMapping.associatedObservationTaxa, newUnits);
    }

    if (associatedSpecimenTaxa) {
      const taxa = associatedSpecimenTaxa.split(DELIMITER).map(taxon => taxon.trim()).filter(taxon => taxon.length > 0);

      this.createNewUnits(taxa, recordBasisMapping.associatedSpecimenTaxa, newUnits);
    }

    gathering.units = [...(gathering.units || []), ...newUnits];

    body.gatherings = [gathering];

    return next.handle();
  }

  createNewUnits(taxa: string[], recordBasis: MYRecordBases, newUnits: Unit[]) {
    taxa.forEach(taxon => {
      const newUnit = this.createNewUnit(taxon, recordBasis);
      newUnits.push(newUnit);
    });
  }

  createNewUnit(taxon: string, recordBasis: MYRecordBases): Unit {
    return {
      recordBasis,
      identifications: [{
        taxon,
      }]
    };
  }
}

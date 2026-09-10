import { Injectable } from '@nestjs/common';

@Injectable()
export class BranchExtractorService {
  open = [
    'eventType',
    'lifeStage',
    'taxonRank',
    'infraRank',
    'datasetID',
    'acquiredFromOrganization',
    'provenance',
    'seedsExchangedInstitution',
  ];
}

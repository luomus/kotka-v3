import { Injectable } from '@nestjs/common';
import { BaseExtractorService } from './base-extractor.service';

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
  ]
}

import { SpecimenSearchService } from './services/specimen-search.service';
import { ExtractorValueMappingService } from './mapper/extractor-value-mapping.service';
import { TypeExtractorService } from './extractor/type-extractor.service';
import { ElasticModule } from '@kotka/api/elasticsearch';
import { Module } from '@nestjs/common';
import { BaseExtractorService } from './extractor/base-extractor.service';
import { IdentificationExtractorService } from './extractor/identification-extractor.service';
import { SampleExtractorService } from './extractor/sample-extractor.service';
import { SpecimenExtractorService } from './extractor/specimen-extractor.service';
import { CacheModule } from '@kotka/api/cache';
import { ApiServicesModule } from '@kotka/api/services';
import { TaxonLinkingModule } from '@kotka/api/taxon-linking';

@Module({
  imports: [
    CacheModule,
    ElasticModule,
    ApiServicesModule,
    TaxonLinkingModule
  ],
  providers: [
    SpecimenSearchService,
    ExtractorValueMappingService,
    TypeExtractorService,
    SampleExtractorService,
    IdentificationExtractorService,
    SpecimenExtractorService,
    BaseExtractorService
  ],
  exports: [
    SpecimenSearchService,
    ExtractorValueMappingService,
    TypeExtractorService,
    SampleExtractorService,
    IdentificationExtractorService,
    SpecimenExtractorService,
    BaseExtractorService,
  ]
})
export class SpecimenSearchModule {}

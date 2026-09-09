import { ElasticModule } from '@kotka/api/elasticsearch';
import { TaxonExtractorService } from './taxon-extractor.service';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TaxonLinkingService } from './taxon-linking.service';
import { CacheModule } from '@kotka/api/cache';

@Module({
  imports: [ ElasticModule, HttpModule, CacheModule ],
  controllers: [],
  providers: [ TaxonExtractorService, TaxonLinkingService ],
  exports: [ TaxonLinkingService ]
})
export class TaxonLinkingModule {}

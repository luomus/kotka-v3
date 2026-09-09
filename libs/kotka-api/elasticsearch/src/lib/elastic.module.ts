import { QueryGeneratorService } from './query-generator.service';
import { EsClientService } from './es-client.service';
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { AutocompleteExtractorService } from './autocomplet-extractor.service';

@Module({
  controllers: [],
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTIC_URL || 'http://elastic:9200',
    })
  ],
  providers: [ QueryGeneratorService, EsClientService, AutocompleteExtractorService ],
  exports: [ EsClientService, AutocompleteExtractorService ],
})
export class ElasticModule {}

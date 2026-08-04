/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api/services';
import { SpecimenSearchModule } from '@kotka/api/specimen-search';
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MigrateCommand } from './commands/migrate.command';
import { SequenceCommand } from './commands/sequence.command';
import { MigrateTestDocumentsCommand } from './commands/migrate-test-documents.command';
import { TaxonLinkingModule } from '@kotka/api/taxon-linking';
import { ElasticModule } from '@kotka/api/elasticsearch';
import { TaxonUpdateCommand } from './commands/taxon-update.command';
import { TestingCommand } from './commands/testing.command';
import { CacheModule } from '@kotka/api/cache';

@Module({

  imports: [
    CacheModule,
    ConsoleModule,
    ApiServicesModule,
    TaxonLinkingModule,
    ElasticModule,
    SpecimenSearchModule
  ],
  controllers: [MigrateCommand, SequenceCommand, MigrateTestDocumentsCommand, TaxonUpdateCommand, TestingCommand ],
  providers: [MigrateCommand, SequenceCommand, MigrateTestDocumentsCommand, TaxonUpdateCommand, TestingCommand ]
})
export class KotkaCliModule {}

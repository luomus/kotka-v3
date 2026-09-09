/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api/services';
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MigrateCommand } from './commands/migrate.command';
import { SequenceCommand } from './commands/sequence.command';
import { TaxonUpdateCommand } from './commands/taxon-update.command';
import { CacheModule } from '@kotka/api/cache';
import { TaxonLinkingModule } from '@kotka/api/taxon-linking';

@Module({

  imports: [
    CacheModule,
    ConsoleModule,
    ApiServicesModule,
    TaxonLinkingModule,
  ],
  providers: [MigrateCommand, SequenceCommand, TaxonUpdateCommand ]
})
export class KotkaCliModule {}

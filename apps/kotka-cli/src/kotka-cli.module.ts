/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api/services';
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MigrateCommand } from './commands/migrate.command';
import { SequenceCommand } from './commands/sequence.command';
import { CacheModule } from '@kotka/api/cache';

@Module({

  imports: [
    CacheModule,
    ConsoleModule,
    ApiServicesModule,
  ],
  providers: [MigrateCommand, SequenceCommand ]
})
export class KotkaCliModule {}

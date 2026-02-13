/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api/services';
import { MappersModule } from '@kotka/api/mappers';
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MigrateCommand } from './commands/migrate.command';
import { SequenceCommand } from './commands/sequence.command';
@Module({
  imports: [ConsoleModule, ApiServicesModule, MappersModule],
  controllers: [MigrateCommand, SequenceCommand],
  providers: [MigrateCommand, SequenceCommand]
})
export class KotkaCliModule {}

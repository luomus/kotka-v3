/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MigrateCommand } from './commands/migrate.command';

@Module({
  imports: [ConsoleModule, ApiServicesModule, MappersModule],
  controllers: [MigrateCommand],
  providers: [MigrateCommand]
})
export class KotkaCliModule {}

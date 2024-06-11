/*
https://docs.nestjs.com/modules
*/

import { ApiServicesModule } from '@kotka/api-services';
import { MappersModule } from '@kotka/mappers';
import { UtilServicesModule } from '@kotka/util-services';
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { MigrateCommand } from './commands/migrate.command';

@Module({
  imports: [ConsoleModule, ApiServicesModule, MappersModule, UtilServicesModule],
  controllers: [MigrateCommand],
  providers: [MigrateCommand]
})
export class KotkaCliModule {}

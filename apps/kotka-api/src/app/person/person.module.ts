import { PersonController } from './person.controller';

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';

@Module({
  imports: [ApiServicesModule],
  controllers: [PersonController],
  providers: []
})
export class PersonModule {}

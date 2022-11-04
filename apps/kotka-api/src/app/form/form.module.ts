import { FormController } from './form.controller';

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';

@Module({
  imports: [ApiServicesModule],
  controllers: [FormController],
  providers: []
})
export class FormModule {}

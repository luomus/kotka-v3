import { AutocompleteController } from './autocomplete.controller';

import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';

@Module({
  imports: [ApiServicesModule],
  controllers: [AutocompleteController],
  providers: []
})
export class AutocompleteModule {}

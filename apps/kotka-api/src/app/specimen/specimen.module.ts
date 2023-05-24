import { SpecimenController } from './specimen.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [SpecimenController],
  providers: []
})
export class SpecimenModule {}

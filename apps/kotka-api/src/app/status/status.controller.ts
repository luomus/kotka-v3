/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';

@Controller('status')
export class StatusController {
  @Get()
  status(): string {
    return 'ok';
  }
}

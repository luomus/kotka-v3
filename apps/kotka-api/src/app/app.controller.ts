import { Controller, Get, UseGuards } from '@nestjs/common';

import { Message } from '@kotka/api-interfaces';

import { AppService } from './app.service';
import { AuthenticateCookieGuard } from './authentication/authenticateCookie.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  @UseGuards(AuthenticateCookieGuard)
  getData(): Message {
    return this.appService.getData();
  }
}

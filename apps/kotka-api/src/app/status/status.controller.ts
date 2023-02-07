/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, BadGatewayException } from '@nestjs/common';
import { LajiStoreService } from '@kotka/api-services';
import { lastValueFrom } from 'rxjs';

@Controller('status')
export class StatusController {
  constructor(
    private readonly lajiStoreService: LajiStoreService,
  ) {}

  @Get()
  async status(): Promise<string> {
    try {
      await lastValueFrom(this.lajiStoreService.getAll('dataset', {page: 1, page_size: 1}));
    } catch (err) {
      console.error(err);
      throw new BadGatewayException(err.message);
    }

    return 'ok';
  }
}

/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Controller,
  Get,
  InternalServerErrorException, NotFoundException,
  Query,
  UseGuards
} from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { LajiStoreService } from '@kotka/api/services';
import { lastValueFrom } from 'rxjs';

@Controller('sequence')
@UseGuards(
  AuthenticateCookieGuard,
)
export class SequenceController {
  constructor(
    protected readonly lajiStoreService: LajiStoreService,
  ) {}

  @Get('accession/next')
  async getAccessionNext() {
    const year =  new Date().getFullYear();
    try {
      const seq = (await lastValueFrom(this.lajiStoreService.getSeqNext(`accession-${year}`, true))).data;

      return `${year}-${seq}`;
    } catch(err) {
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  @Get('generate/next')
  async getSequenceNext(
    @Query('value') value: string
  ) {
    value = value.trim();

    const parts = value.split(':');

    if (parts.length === 1 || !parts[0] || (parts.length > 1 && !!parts[1])) {
      return value;
    }

    try {
      const seq = (await lastValueFrom(this.lajiStoreService.getSeqNext(parts[0]))).data;
      return `${parts[0]}:${seq}`;
    } catch (err) {
      if (err.status === 404) {
        throw new NotFoundException(err.response?.data?.message || err.message);
      }

      console.error(err);
      throw new InternalServerErrorException(err.response?.data?.message || err.message);
    }
  }
}

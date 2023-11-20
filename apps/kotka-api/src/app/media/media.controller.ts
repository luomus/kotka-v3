/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { MediaService, NewMediaFile } from './media.service';
import { lastValueFrom, map } from 'rxjs';
import { Request } from 'express';
//@ts-ignore
import { Multer } from 'multer';
import { MediaTypeValidatorInterceptor } from './media-type-size-validator.interceptor';
import { Person } from '@kotka/shared/models';
import {} from './media.service';

@Controller('media')
@UseGuards(AuthenticateCookieGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService
  ) {}

  @Post(':type')
  @UseInterceptors(AnyFilesInterceptor(), MediaTypeValidatorInterceptor)
  async postMedia(@UploadedFiles() files: Express.Multer.File[], @Param('type') type) {

    return this.mediaService.postMedia(type, files);
  }

  @Post(':type/:tempId')
  async postMetadata(@Param('type') type, @Param('tempId') tempId, @Body() body) {
    const newMedia: NewMediaFile[] = [
      {
        tempFileId: tempId,
        meta: body
      }
    ];

    return this.mediaService.postMetadata(type, newMedia);
  }

  @Get(':type/:id')
  async getMedia(@Param('type') type: string, @Param('id') id: string) {
    return this.mediaService.getMedia(id, type);
  }

  @Put(':type/:id')
  async putMedia(@Param('type') type: string, @Param('id') id: string, @Body() body) {
    return this.mediaService.putMetadata(id, type, body);
  }
}
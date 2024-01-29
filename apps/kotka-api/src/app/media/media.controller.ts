/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Param, Post, Put, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { MediaService, NewMediaFile } from './media.service';
import { MediaTypeValidatorInterceptor } from './media-type-size-validator.interceptor';
import { map } from 'rxjs';

@Controller('media')
@UseGuards(AuthenticateCookieGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService
  ) {}

  @Post(':type')
  @UseInterceptors(AnyFilesInterceptor(), MediaTypeValidatorInterceptor)
  postMedia(@UploadedFiles() files: Express.Multer.File[], @Param('type') type) {
    return this.mediaService.postMedia(type, files);
  }

  @Post(':type/:tempId')
  postMetadata(@Req() request, @Param('type') type, @Param('tempId') tempId, @Body() body) {
    const profile = request.user.profile;
    const newMedia: NewMediaFile[] = [
      {
        tempFileId: tempId,
        meta: this.mediaService.mediaToMeta(profile, body)
      }
    ];

    return this.mediaService.postMetadata(type, newMedia).pipe(map(data => data[0]));
  }

  @Get(':type/:id')
  getMedia(@Param('type') type: string, @Param('id') id: string) {
    return this.mediaService.getMedia(id, type).pipe(map(data => this.mediaService.metaToType(type, data)));
  }

  @Put(':type/:id')
  putMedia(@Param('type') type: string, @Param('id') id: string, @Body() body) {
    return this.mediaService.putMetadata(id, type, body);
  }
}

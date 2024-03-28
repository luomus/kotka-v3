/*
https://docs.nestjs.com/controllers#controllers
*/

import { BadRequestException, Body, Controller, Get, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { AuthenticateCookieGuard } from '../authentication/authenticateCookie.guard';
import { MediaApiService, NewMediaFile } from '@kotka/api-services';
import { map } from 'rxjs';
import { Image } from '@luomus/laji-schema';
import { ErrorMessages } from '@kotka/api-interfaces';

@Controller('media')
@UseGuards(AuthenticateCookieGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaApiService
  ) {}

  @Post(':type')
  postMedia(@Req() req, @Res() res, @Param('type') type) {
    return this.mediaService.postMediaStreaming(type, req, res);
  }

  @Post(':type/:tempId')
  postMetadata(@Req() request, @Param('type') type: string, @Param('tempId') tempId: string, @Body() body: Image) {
    if (!body.intellectualOwner) {
      throw new BadRequestException(ErrorMessages.missingIntellectualOwner);
    }
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

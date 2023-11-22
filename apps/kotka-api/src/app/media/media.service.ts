/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import FormData from 'form-data';
import { merge } from 'lodash';
import { catchError, map } from 'rxjs';
import { Person, Image } from '@kotka/shared/models';
//@ts-ignore
import { Multer } from 'multer';

export type FileUploadResponse = {
  name: string,
  fileName: string,
  id: string,
  expires: number,
}

export type NewMediaFile = {
  tempFileId: string,
  meta: Meta,
}

export type Meta = {
  license: Image['intellectualRights'],
  rightsOwner: string,
  secret?: boolean,
  capturers?: string[],
  captureDateTime?: string,
  uploadedBy?: string,
  originalFilename?: string,
  documentId?: string,
  tags?: string[],
  identifications?: Identifications,
  primaryForTaxon?: string[],
  caption?: string,
  taxonDescriptionCaption?: {
    en: string,
    fi?: string,
    sv?: string,
  }
  sex?: string[],
  lifeStage?: string[],
  plantLifeStage?: string[],
  type?: string[],
  sortOrder?: number,
  uploadedDateTime?: string,
  sourceSystem?: string,
}

export type Identifications = {
  taxonIds: string[],
  verbatim: string[],
}
export type Media = {
  id: string,
  secretKey: string,
  urls: Urls,
  meta: Meta,
}

export type Urls = {
  original: string,
  full: string,
  large: string,
  square: string,
  thumbnail: string,
  pdf: string,
  mp3: string,
  wav: string,
  video: string,
  lowDetailModel: string,
  highDetailModel: string,
}

@Injectable()
export class MediaService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private mediaClasses = {
    images: 'IMAGE',
    pdf: 'PDF'
  };

  private urlBase = process.env['MEDIA_API_URL'];
  private baseConfig = { headers: { Authorization: 'Basic ' + process.env['MEDIA_API_AUTH'] }};

  postMedia(type: string, files: Express.Multer.File[]) {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append(file.originalname, file.buffer, file.originalname);
    });

    return this.httpService.post<FileUploadResponse[]>(`${this.urlBase}api/fileUpload`, formData, merge({
        params: {
          mediaClass: this.mediaClasses[type]
        },
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }, this.baseConfig)
    ).pipe(
      map(res => res.data),
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Error uploading media to Media-API', e.message);
      })
    );
  }

  getMedia(id: string, type: string) {
    return this.httpService.get<Media>(`${this.urlBase}api/${type}/${id}`, this.baseConfig).pipe(
      map(res => res.data),
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Getting media from Media-API', e.message);
      })
    );
  }

  postMetadata(type: string, meta: NewMediaFile[]) {
    return this.httpService.post<Media[]>(`${this.urlBase}api/${type}`, meta, this.baseConfig).pipe(
      map(res => res.data),
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Error uploading media metadata to Media-API', e.message);
      })
    );
  }

  putMetadata(id: string, type: string, meta: Meta) {
    return this.httpService.put(`${this.urlBase}api/${type}/${id}`, meta, this.baseConfig).pipe(
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Error updating media metadata to Media-API', e.message);
      })
    );
  }

  mediaToMeta(profile: Person, media: Image, current?: Meta): Meta {
    return {
      ...(current || {}),
      capturers: media.capturerVerbatim,
      rightsOwner: media.intellectualOwner,
      license: media.intellectualRights,
      caption: media.caption,
      captureDateTime: media.captureDateTime,
      tags: media.keyword,
      uploadedBy: current?.uploadedBy || profile.id,
      sortOrder: media.sortOrder || current?.sortOrder,
      secret: (media.publicityRestrictions && media.publicityRestrictions !== 'MZ.publicityRestrictionsPublic') || false
    };
  }

  metaToType(type: string, media: Media) {
    switch (type) {
      case 'pdf':
        return this.metaToPDF(media);
    };
  }

  metaToPDF(media: Media) {
    const { meta, urls } = media;

    return {
      caption: meta.caption,
      documentURI: [ meta.documentId ],
      fullURL: urls.full,
      intellectualOwner: meta.rightsOwner,
      intellectualRights: meta.license,
      keyword: meta.tags,
      largeURL: urls.large,
      originalFilename: meta.originalFilename,
      originalURL: urls.original,
      pdfUrl: urls.pdf,
      publicityRestrictions: meta.secret ? 'MZ.publicityRestrictionsPrivate' : 'MZ.publicityRestrictionsPublic',
      sourceSystem: meta.sourceSystem,
      squareThumbnailURL: urls.square,
      thumbnailURL: urls.thumbnail,
      uploadDateTime: meta.uploadedDateTime,
      uploadedBy: meta.uploadedBy,
    };
  }
}

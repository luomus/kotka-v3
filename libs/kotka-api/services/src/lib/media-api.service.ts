/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from '@nestjs/axios';
import https from 'https';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import FormData from 'form-data';
import { merge } from 'lodash';
import { catchError, map } from 'rxjs';
import { Person, Image, Pdf } from '@kotka/shared/models';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import { Request, Response } from 'express';

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
  id?: string,
  license: Image['intellectualRights'],
  rightsOwner: string,
  secret?: boolean,
  capturers?: string[],
  captureDateTime?: number,
  uploadedBy?: string,
  originalFilename?: string,
  documentIds?: string[],
  tags?: string[],
  identifications?: Identifications,
  primaryForTaxon?: string[],
  caption?: string,
  taxonDescriptionCaption?: {
    en?: string,
    fi?: string,
    sv?: string,
  }
  sex?: string[],
  lifeStage?: string[],
  plantLifeStage?: string[],
  type?: string[],
  sortOrder?: number,
  uploadDateTime?: number,
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
export class MediaApiService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private mediaClasses = {
    images: 'IMAGE',
    pdf: 'PDF'
  };

  private urlBase = process.env['MEDIA_API_URL'];
  private baseConfig = { headers: { Authorization: 'Basic ' + process.env['MEDIA_API_AUTH'] }};

  postMediaStreaming(type: 'pdf' | 'images', req: Request, res: Response) {
    const proxy = https.request(`${this.urlBase}api/fileUpload`, merge({
      method: 'post',
      params: {
        mediaClass: this.mediaClasses[type]
      },
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
      }
    }, this.baseConfig), (response) => {
      const headers = new Headers({
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length']
      });
      response.pipe(res.setHeaders(headers));
    });

    req.pipe(proxy);
  }

  postMedia(type: 'pdf' | 'images', files: Express.Multer.File[]) {
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
        throw new InternalServerErrorException('Error getting media from Media-API', e.message);
      })
    );
  }

  findMediaByDocumentId(id: string, type: string) {
    return this.httpService.get<Meta[]>(`${this.urlBase}api/${type}`, {...this.baseConfig, params: { documentIds: id }}).pipe(
      map(res => res.data),
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Error searching for media from Media-API', e.message);
      })
    );
  }

  deleteMedia(id: string, type: string) {
    return this.httpService.delete(`${this.urlBase}api/${type}/${id}`, this.baseConfig).pipe(
      map(res => res.data),
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Error deleting media from Media-API', e.message);
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

  typeToMeta(type: string, profile: Person, media: Image | Pdf): Meta {
    switch (type) {
      case 'pdf':
        return this.pdfToMeta(profile, media as Pdf);
      case 'images':
        return this.imageToMeta(profile, media as Image);
      default:
        return;
    }
  }
  imageToMeta(profile: Person, media: Image, current?: Meta): Meta {
    return {
      ...this.mediaToMeta(profile, media, current),
      capturers: media.capturerVerbatim,
      captureDateTime: media.captureDateTime ? new Date(media.captureDateTime).getTime() : undefined,
      taxonDescriptionCaption: media.taxonDescriptionCaption,
      sortOrder: media.sortOrder || current?.sortOrder,
    };
  }

  pdfToMeta(profile: Person, media: Pdf, current?: Meta): Meta {
    return this.mediaToMeta(profile, media, current);
  }

  mediaToMeta(profile: Person, media: Image | Pdf, current?: Meta): Meta {
    return {
      ...(current || {}),
      documentIds: media.documentURI,
      rightsOwner: media.intellectualOwner,
      license: media.intellectualRights,
      caption: media.caption,
      tags: media.keyword,
      uploadedBy: current?.uploadedBy || profile.id,
      secret: (media.publicityRestrictions && media.publicityRestrictions !== 'MZ.publicityRestrictionsPublic') || false
    };
  }

  metaToType(type: string, media: Media) {
    switch (type) {
      case 'pdf':
        return this.metaToPDF(media);
      case 'images':
        return this.metaToImage(media);
      default:
        return;
    }
  }

  metaToMedia<T extends Image | Pdf>(meta: Meta, urls: Urls): T{
    return {
      caption: meta.caption,
      documentURI: meta.documentIds,
      fullURL: urls.full,
      intellectualOwner: meta.rightsOwner,
      intellectualRights: meta.license,
      keyword: meta.tags,
      largeURL: urls.large,
      originalFilename: meta.originalFilename,
      originalURL: urls.original,
      publicityRestrictions: meta.secret ? 'MZ.publicityRestrictionsPrivate' : 'MZ.publicityRestrictionsPublic',
      sourceSystem: meta.sourceSystem,
      squareThumbnailURL: urls.square,
      taxonDescriptionCaption: meta.taxonDescriptionCaption,
      thumbnailURL: urls.thumbnail,
      uploadDateTime: meta.uploadDateTime ? new Date(meta.uploadDateTime * 1000).toISOString() : undefined,
      uploadedBy: meta.uploadedBy,
    } as T;
  }

  metaToImage(media: Media): Image {
    const { id, meta, urls } = media;

    return {
      id,
      ...this.metaToMedia<Image>(meta, urls),
      capturerVerbatim: meta.capturers,
      captureDateTime: meta.captureDateTime ? new Date(meta.captureDateTime * 1000).toISOString() : undefined,
      taxonDescriptionCaption: meta.taxonDescriptionCaption,
      sortOrder: meta.sortOrder,
    };
  }


  metaToPDF(media: Media): Pdf {
    const { id, meta, urls, secretKey } = media;

    Object.keys(urls).forEach((key: string) => {
      if (urls[key as keyof Urls]) {
        urls[key as keyof Urls] = urls[key as keyof Urls] + '?secret=' + secretKey;
      }
    });

    return {
      id,
      ...this.metaToMedia(meta, urls),
      pdfURL: urls.pdf
    };
  }
}

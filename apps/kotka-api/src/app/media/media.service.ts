/*
https://docs.nestjs.com/providers#services
*/

import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import FormData from 'form-data';
import { merge } from 'lodash';
import { catchError, map } from 'rxjs';
import { Person } from '@kotka/shared/models';
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

  license: string,
  rightsOwner: string,
  secret?: boolean,
  capturers?: [string],
  captureDateTime?: string,
  uploadedBy?: string,
  originalFilename?: string,
  documentId?: string,
  tags?: [string],
  identifications?: Identifications,
  primaryForTaxon?: [string],
  caption?: string,
  taxonDescriptionCaption?: {
    en: string,
    fi?: string,
    sv?: string,
  }
  sex?: [string],
  lifeStage?: [string],
  plantLifeStage?: [string],
  type?: [string],
  sortOrder?: number,
}

export type Identifications = {
  taxonIds: [string],
  verbatim: [string],
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
    console.log(files);
    files.forEach((file, idx) => {
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

  async getMedia(id: string, type: string) {
    return this.httpService.get<Media>(`${this.urlBase}api/${type}/${id}`, this.baseConfig).pipe(
      map(res => res.data),
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Getting media from Media-API', e.message);
      })
    );
  }

  async postMetadata(type: string, meta: NewMediaFile[]) {
    return this.httpService.post<Media[]>(`${this.urlBase}api/${type}`, meta, this.baseConfig).pipe(
      map(res => res.data),
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Error uploading media metadata to Media-API', e.message);
      })
    );
  }

  async putMetadata(id: string, type: string, meta: Meta) {
    return this.httpService.put(`${this.urlBase}api/${type}/${id}`, meta, this.baseConfig).pipe(
      catchError(e => {
        console.error(e);
        throw new InternalServerErrorException('Error updating media metadata to Media-API', e.message);
      })
    );
  }

  defaultMetadata(fileName: string, profile: Person): Meta {
    return {
      license: 'MZ.intellectualRightsCC-BY-SA-4.0',
      rightsOwner: profile.fullName,
      secret: false,
      uploadedBy: profile.id,
      originalFilename: fileName,
    };
  }
}

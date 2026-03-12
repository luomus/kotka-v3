/*
https://docs.nestjs.com/interceptors#interceptors
*/

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Observable, lastValueFrom, map } from 'rxjs';
import { Pdf, Image, Person, Document, KotkaDocumentObjectFullType } from '@kotka/shared/models';
import { MediaApiService, MediasEnum, MediaTypes, LajiStoreService } from '@kotka/api/services';
import { getId } from '@kotka/shared/utils';

@Injectable()
export class MediaAccessInterceptor implements NestInterceptor {
  constructor (
    private readonly mediaApiService: MediaApiService,
    private readonly lajiStoreService: LajiStoreService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<Pdf | Image>> {
    const req = context.switchToHttp().getRequest();
    const profile: Person = req.user?.profile;

    if (!profile) {
      throw new HttpException('Missing user data', HttpStatus.FORBIDDEN);
    }

    const type: MediaTypes = req.params['type'];

    if (!type) {
      throw new HttpException('Missing type parameter', HttpStatus.BAD_REQUEST);
    }

    if (req.method === 'POST') {
      await this.canPostMedia(type, profile, req.body);

    } else if (req.method === 'PUT' || req.method === 'DELETE') {
      const id = req.params['id'];

      if (!id) {
        throw new HttpException('Missing id parameter', HttpStatus.BAD_REQUEST);
      }

      if (req.method === 'DELETE') {
        await this.canDeleteMedia(type, id, profile);
      }

      if (req.method === 'PUT') {
        await this.canEditMedia(type, id, req.body, profile);
      }
    }

    if(req.method === 'GET') {
      return next
        .handle()
        .pipe(
          map((data: Pdf | Image) => {
            this.canGetMedia(type, profile, data)

            return data;
          }),
        );
    }

    return next.handle();
  }

  canGetMedia(type: MediaTypes, profile: Person, data: Pdf | Image) {
    if (this.canAccessByAdmin(profile)) return;
    if (type === MediasEnum.images) return;
    if (type === MediasEnum.pdf && profile.organisation?.includes(data.intellectualOwner)) return;

    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async canDeleteMedia(type: MediaTypes, id: string, profile: Person) {
    if (this.canAccessByAdmin(profile)) return;

    if (type === MediasEnum.images && profile.roleKotka === 'MA.advanced') {
      const meta = await this.getOldMetadata(type, id);
      const ids = meta.documentURI!.map(uri => getId(uri));

      return await this.canAccessAllDocumentsOrganization(profile, ids);
    }

    if (type === MediasEnum.pdf) {
      const meta = await this.getOldMetadata(type, id);

      if (this.canAccessByOrganization(profile, meta.intellectualOwner)) return;
    }

    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  async canEditMedia(type: MediaTypes, id: string, newMeta: Pdf | Image, profile: Person) {
    if (this.canAccessByAdmin(profile)) return;

    const oldMeta = await this.getOldMetadata(type, id);

    if (type === MediasEnum.pdf && this.canAccessByOrganization(profile, oldMeta.intellectualOwner)) { return }
    else if (type === MediasEnum.images) {
      const { all, removed, added } = this.getDiffOfSpecimenIDs((oldMeta as Image).documentURI?.map(uri => getId(uri)), (newMeta as Image).documentURI?.map(uri => getId(uri)))

      let docs: Partial<Document>[];
      if (all.length === 1) {
        const doc = await lastValueFrom(this.lajiStoreService.get<Document>(
          KotkaDocumentObjectFullType.document,
          all[0]
        ).pipe(map(res => res.data)));

        docs = [doc];
      } else {
        docs = await lastValueFrom(this.lajiStoreService.getAll<Document>(
          KotkaDocumentObjectFullType.document,
          {q: `id: ${all.map(id => `"${id}"`).join(',')}`, fields: "id,owner"}
        ).pipe(map(res => res.data.member)));
      }

      const canEdit = docs.filter(doc => this.canAccessByOrganization(profile, doc.owner!)).map(doc => doc.id);

      if (!canEdit.length) {
        throw new HttpException('Forbidden to edit image metadata, no right to edit associated document/s', HttpStatus.FORBIDDEN);
      }

      if (removed && !removed.every(doc => canEdit.includes(doc))) {
        throw new HttpException('Forbidden to remove specimenID from metadata, no right to edit associated document/s', HttpStatus.FORBIDDEN);
      }

      if (added && !added.every(doc => canEdit.includes(doc))) {
        throw new HttpException('Forbidden to add specimenID to metadata, no right to edit associated document/s', HttpStatus.FORBIDDEN);
      }
    }
  }

  async canPostMedia(type: MediaTypes, profile: Person, meta: Image | Pdf) {
    if (type === MediasEnum.pdf && (this.canAccessByAdmin(profile) || this.canAccessByOrganization(profile, meta.intellectualOwner))) { return; }
    if (type === MediasEnum.images && this.canAccessByAdmin(profile)) { return; }
    else if (type === MediasEnum.images) {
      const ids = meta.documentURI?.map(id => getId(id));

      return await this.canAccessAllDocumentsOrganization(profile, ids);
    }

    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  canAccessByAdmin(profile: Person) {
    return profile.role?.includes('MA.admin') || profile.roleKotka === 'MA.admin';
  }

  canAccessByOrganization(profile: Person, owner: string) {
    return owner && profile.organisation?.includes(owner);
  }

  async canAccessAllDocumentsOrganization(profile: Person, ids: string[] | undefined) {
    if (!ids?.length) throw new InternalServerErrorException('No documetURI:s found in metadata.');

    if (ids.length === 1) {
      const doc = await lastValueFrom(this.lajiStoreService.get<Document>(
        KotkaDocumentObjectFullType.document,
        ids[0]
      ).pipe(map(res => res.data)));

      if (doc.owner && profile.organisation?.includes(doc.owner)) return;

      throw new HttpException('Forbidden, no rights to document/s associated with the image', HttpStatus.FORBIDDEN);

    } else if(ids.length > 1) {
      const docs = await lastValueFrom(this.lajiStoreService.getAll<Document>(
        KotkaDocumentObjectFullType.document,
        {q: `id: ${ids.map(id => `"${id}"`).join(',')}`, fields: "id,owner"}
      ).pipe(map(res => res.data.member)));

      if(docs.every(doc => doc.owner ? profile.organisation?.includes(doc.owner) : false)) return;

      throw new HttpException('Forbidden, no rights to document/s associated with the image', HttpStatus.FORBIDDEN)
    }
  }

  async getOldMetadata(type: MediaTypes, id: string): Promise<Pdf | Image> {
    const meta = await lastValueFrom(this.mediaApiService.getMedia(id, type).pipe(map(data => this.mediaApiService.metaToType(type, data))));

    if (!meta) {
      throw new HttpException('Media metadata not available for deleton rights check', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return meta;
  }
  getDiffOfSpecimenIDs(oldSpecimenIDs: string[] | undefined, newSpecimenIDs: string[] | undefined) {
    let common: string[] = [];

    if (oldSpecimenIDs && newSpecimenIDs) {
      common = oldSpecimenIDs.filter(specimen => newSpecimenIDs.includes(specimen));
    }

    let removed: string[] = [];

    if (oldSpecimenIDs) {
      removed = oldSpecimenIDs.filter(specimen => !common.includes(specimen));
    }

    let added: string[] = [];

    if (newSpecimenIDs) {
      added = newSpecimenIDs.filter(specimen => !common.includes(specimen));
    }

    return {
      all: [...common, ...removed, ...added],
      removed,
      added
    }
  }
}

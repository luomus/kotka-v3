import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { TriplestoreService } from '@kotka/api-services';
import { TriplestoreMapperService } from '@kotka/mappers';
import { Collection, Organization } from '@luomus/laji-schema';
import { lastValueFrom, map, switchMap } from 'rxjs';
import { Cached } from '../decorators/cached.decorator';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';

const collectionType = 'MY.collection';
const organizationType = 'MOS.organization';

@Injectable()
export class OldKotkaDataService {
  constructor(
    private readonly triplestoreService: TriplestoreService,
    private readonly triplestoreMapperService: TriplestoreMapperService
  ) {};

  async getCollection(id: string) {
    return this.getObject<Collection>(collectionType, id);
  }

  async getCollections(ids: string[]) {
    return this.getObjects<Collection>(collectionType, ids);
  }

  @Cached('allCollections', 12 * 60 * 60 * 1000) // 12 h
  async getAllCollections() {
    return this.getAllObjects<Collection>(collectionType);
  }

  @Timeout(0)
  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateCollectionsCache() {
    await this.getAllCollections();
  }

  async getOrganization(id: string) {
    return this.getObject<Organization>(organizationType, id);
  }

  async getOrganizations(ids: string[]) {
    return this.getObjects<Organization>(organizationType, ids);
  }

  @Cached('allOrganizations', 12 * 60 * 60 * 1000) // 12 h
  async getAllOrganizations() {
    return this.getAllObjects<Organization>(organizationType);
  }

  @Timeout(0)
  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateOrganizationsCache() {
    await this.getAllOrganizations();
  }

  private async getObject<T>(type: string, id: string) {
    try {
      return await lastValueFrom(
        this.triplestoreService.get(id).pipe(
          map(data => data.data),
          switchMap(data => this.triplestoreMapperService.triplestoreToJson(data, type)),
        )
      ) as T;
    } catch (err) {
      if (err.response.status === HttpStatus.NOT_FOUND) {
        throw new NotFoundException();
      }
      console.error(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  private async getObjects<T>(type: string, ids: string[]) {
    return await lastValueFrom(
      this.triplestoreService.search({ type, subject: ids.join(',') }).pipe(
        map(data => data.data),
        switchMap(data => this.triplestoreMapperService.triplestoreToJson(data, type)),
      )
    ) as T[];
  }

  private async getAllObjects<T>(type: string): Promise<T[]> {
    const triplestoreData = await lastValueFrom(this.triplestoreService.search({type}));
    return await this.triplestoreMapperService.triplestoreToJson(triplestoreData.data, type) as T[];
  }
}

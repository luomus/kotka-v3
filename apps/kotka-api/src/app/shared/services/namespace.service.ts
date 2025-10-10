/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { Cached } from '../decorators/cached.decorator';
import { SpecimenUrlDataType } from '@kotka/shared/models';
import { TriplestoreService } from '@kotka/api/services';

export interface NamespaceData {
  namespace_id: string,
  person_in_charge: string,
  purpose: string,
  namespace_type: SpecimenUrlDataType | 'all' | '',
  qname_prefix: string
}
@Injectable()
export class NamespaceService {
  constructor (
    private readonly triplestoreService: TriplestoreService
  ) {}

  @Cached('namespaces', 24 * 3600 * 1000)
  async getNamespaces(): Promise<NamespaceData[]> {
    return (await lastValueFrom(this.triplestoreService.namespaces())).data;
  }
}

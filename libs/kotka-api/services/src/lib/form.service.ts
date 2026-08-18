/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { LajiApiService } from './laji-api.service';
import { KotkaObjectFullType } from '@kotka/shared/models';

const types: Partial<{ [type in KotkaObjectFullType]: string }> = {
  [KotkaObjectFullType.dataset]: 'MHL.731',
  [KotkaObjectFullType.organization]: 'MHL.1152',
  [KotkaObjectFullType.transaction]: 'MHL.930',
  [KotkaObjectFullType.document]: 'MHL.1158',
  [KotkaObjectFullType.branch]: 'MHL.1230',
};

@Injectable()
export class FormService {
  private forms: { [type: string]: Record<string, unknown> } = {};


  constructor(
    private readonly lajiApiService: LajiApiService
  ) {}

  async getForm(type: KotkaObjectFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type];
  }

  async getValidators(type: KotkaObjectFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type]['validators'];
  }

  async getSchema(type: KotkaObjectFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type]['schema'];
  }

  async initForm(type: KotkaObjectFullType) {
    if (!types[type]) {
      throw new InternalServerErrorException(`Could not find formId for document of type ${type}`);
    }

    try {
      const res = await lastValueFrom(this.lajiApiService.get<Record<string, unknown>>(`forms/${types[type]}`));
      this.forms[type] = res.data;
    } catch (e: any) {
      throw new InternalServerErrorException('Unable to fetch form for validation.', e.message);
    }
  }
}

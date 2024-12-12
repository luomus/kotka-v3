/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { LajiApiService } from './laji-api.service';
import { KotkaDocumentObjectFullType } from '@kotka/shared/models';

const types: {[ type in KotkaDocumentObjectFullType ]: string} = {
  [KotkaDocumentObjectFullType.dataset]: 'MHL.731',
  [KotkaDocumentObjectFullType.organization]: 'MHL.1152',
  [KotkaDocumentObjectFullType.transaction]: 'MHL.930',
  [KotkaDocumentObjectFullType.document]: '',
  [KotkaDocumentObjectFullType.sample]: ''
};

@Injectable()
export class FormService {
  private forms: { [type: string]: Record<string, unknown> } = {};


  constructor(
    private readonly lajiApiService: LajiApiService
  ) {}

  async getForm(type: KotkaDocumentObjectFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type];
  }

  async getValidators(type: KotkaDocumentObjectFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type]['validators'];
  }

  async getSchema(type: KotkaDocumentObjectFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type]['schema'];
  }

  async initForm(type: KotkaDocumentObjectFullType) {
    if (!types[type]) {
      throw new InternalServerErrorException(`Could not find formId for document of type ${type}`);
    }

    try {
      const res = await lastValueFrom(this.lajiApiService.get<Record<string, unknown>>(`/forms/${types[type]}`));
      this.forms[type] = res.data;
    } catch (e: any) {
      throw new InternalServerErrorException('Unable to fetch form for validation.', e.message);
    }
  }
}

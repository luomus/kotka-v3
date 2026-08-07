/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { LajiApiService } from './laji-api.service';
import { KotkaDocumentFullType } from '@kotka/shared/models';

const types: Partial<{ [type in KotkaDocumentFullType]: string }> = {
  [KotkaDocumentFullType.dataset]: 'MHL.731',
  [KotkaDocumentFullType.organization]: 'MHL.1152',
  [KotkaDocumentFullType.transaction]: 'MHL.930',
  [KotkaDocumentFullType.document]: 'MHL.1158',
  [KotkaDocumentFullType.branch]: 'MHL.1230',
};

@Injectable()
export class FormService {
  private forms: { [type: string]: Record<string, unknown> } = {};


  constructor(
    private readonly lajiApiService: LajiApiService
  ) {}

  async getForm(type: KotkaDocumentFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type];
  }

  async getValidators(type: KotkaDocumentFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type]['validators'];
  }

  async getSchema(type: KotkaDocumentFullType) {
    if (!this.forms[type]) {
      await this.initForm(type);
    }

    return this.forms[type]['schema'];
  }

  async initForm(type: KotkaDocumentFullType) {
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

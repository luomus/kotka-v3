import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class SchemaService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private baseUrl = process.env['LAJI_STORE_URL'];

  public getContext(target: string) {
    return this.httpService.get(this.baseUrl + 'json-ld-context/'+ target + '.json');
  }
}
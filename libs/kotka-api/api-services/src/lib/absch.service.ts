import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AbschService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  private baseUrl = "https://api.cbd.int/api/v2013/";

  public async checkIRCCNumberIsValid(IRCCNumber: string): Promise<boolean> {
    const match = IRCCNumber.match(/^ABSCH-IRCC-[A-Z]{2}-([0-9]{6,7})-[1-9]$/);
    if (!match) {
      return false;
    }

    const url = `${this.baseUrl}documents/${match[1]}?include-deleted=true`;
    try {
      await lastValueFrom(this.httpService.get(url, { timeout: 30000 }));
    } catch (e: any) {
      if (e?.response?.status === 404) {
        return false;
      }
      throw e;
    }

    return true;
  }
}

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthenticationService {

  constructor(
    private readonly httpService: HttpService,
  ) {}

  public getLoginUrl(): string {
    return `${process.env.LAJI_AUTH_URL}?target=${process.env.SYSTEM_ID}&redirectMethod=GET&next=`
  }

  public async getProfile(token: string) {
    const person = await firstValueFrom(this.httpService.get<{id: string}>(`${process.env.LAJI_API_URL}/person/${token}`))

    const userProfile = await firstValueFrom(this.httpService.get(`${process.env.LAJI_STORE_URL}/person/${person.data.id}`))

    return userProfile.data
  }
}

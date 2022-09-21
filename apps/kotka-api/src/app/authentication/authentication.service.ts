import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, map } from 'rxjs';

const kotkaRoles = [
  'MA.admin',
  'MA.advanced',
  'MA.member',
  'MA.guest',
];

@Injectable()
export class AuthenticationService {

  constructor(
    private readonly httpService: HttpService,
  ) {}

  public getLoginUrl(): string {
    return `${process.env.LAJI_AUTH_URL}?target=${process.env.SYSTEM_ID}&redirectMethod=GET&next=`
  }

  public getProfile(token: string) {
    const person = this.httpService.get(`${process.env['LAJI_API_URL']}/person/${token}`, { params: { access_token: process.env['LAJI_API_TOKEN']}}).pipe(
      catchError((err) => { throw new UnauthorizedException('Error retrieving user profile from laji-auth.')}),
      map(res => res.data),
      map(data => {
        if (!data) {
          throw new UnauthorizedException('No profile data fond.');
        }
        
        return data;
      }),
      map(data => {
        if (!data.roleKotka || !kotkaRoles.includes(data.roleKotka)) {
          throw new UnauthorizedException('User missing Kotka role.');
        }

        return data;
      }),
      map(data => ({
        personToken: token,
        profile: data
      })),
    );

    return person;
  }

  public logoutUser(token: string) {
    return this.httpService.delete(`${process.env['LAJI_API_URL']}/person-token/${token}`, { params: { access_token: process.env['LAJI_API_TOKEN']}}).pipe(
      catchError((err) => { throw new InternalServerErrorException('Error terminating user laji-auth login.')})
    );
  }

  public checkLoginValidity(token: string) {
    return this.httpService.get(`${process.env['LAJI_API_URL']}/person-token/${token}`, { params: { access_token: process.env['LAJI_API_TOKEN']}}).pipe(
      catchError((err) => { throw new UnauthorizedException('Error validating user personToken.') })
    );
  }
}
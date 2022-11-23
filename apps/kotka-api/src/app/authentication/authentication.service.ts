import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { catchError, map, mergeMap } from 'rxjs';
import { LajiApiService } from '@kotka/api-services';

const kotkaRoles = [
  'MA.admin',
  'MA.advanced',
  'MA.member',
  'MA.guest',
];

@Injectable()
export class AuthenticationService {

  constructor(
    private readonly lajiApiSevice: LajiApiService,
  ) {}

  public getLoginUrl(): string {
    return `${process.env.LAJI_AUTH_URL}?target=${process.env.SYSTEM_ID}&redirectMethod=GET&next=`;
  }

  public getProfile(token: string) {
    const $person = this.lajiApiSevice.get(`person-token/${token}`).pipe(
      catchError((err) => { throw new UnauthorizedException('Error retrieving personToken information from laji-auth.', err); }),
      mergeMap((res) => {
        if (res.data.target !== process.env['SYSTEM_ID']) {
          throw new UnauthorizedException('PersonToken for different system.');
        }

        return this.lajiApiSevice.get(`person/${token}`).pipe(
          catchError((err) => { throw new UnauthorizedException('Error retrieving user profile from laji-auth.', err); }),
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
      })
    );

    return $person;
  }

  public logoutUser(token: string) {
    return this.lajiApiSevice.delete(`person-token/${token}`).pipe(
      catchError((err) => { throw new InternalServerErrorException('Error terminating user laji-auth login.', err); })
    );
  }

  public checkLoginValidity(token: string) {
    return this.lajiApiSevice.get(`person-token/${token}`).pipe(
      catchError((err) => { throw new UnauthorizedException('Error validating user personToken.', err); }),
    );
  }
}

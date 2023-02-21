import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { catchError, map, mergeMap, tap } from 'rxjs';
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

  public getLoginUrl(next = ''): string {
    return `${process.env.LAJI_AUTH_URL}?target=${process.env.SYSTEM_ID}&redirectMethod=POST&next=${next}`;
  }

  public getProfile(token: string) {
    const $person = this.lajiApiSevice.get<any>(`person-token/${token}`).pipe(
      catchError((err) => { throw new UnauthorizedException('Error retrieving personToken information from laji-auth.', err.message); }),
      mergeMap((res) => {
        if (res.data.target !== process.env['SYSTEM_ID']) {
          throw new UnauthorizedException('PersonToken for different system.');
        }

        const next = res.data.next;

        return this.lajiApiSevice.get<any>(`person/${token}`).pipe(
          catchError((err) => { throw new UnauthorizedException('Error retrieving user profile from laji-auth.', err.message); }),
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
            profile: data,
            next
          })),
        );
      })
    );

    return $person;
  }

  public logoutUser(request) {
    return this.lajiApiSevice.delete(`person-token/${request.user?.personToken}`).pipe(
      tap(() => this.invalidateSession(request)),
      catchError((err) => {
        throw new InternalServerErrorException('Error terminating user laji-auth login.', err.message);
      }),
    );
  }

  public checkLoginValidity(request) {
    return this.lajiApiSevice.get(`person-token/${request.user.personToken}`).pipe(
      catchError((err) => {
        if (err.response?.data?.error?.message && err.response?.data?.error?.message.includes('INVALID TOKEN')) {
          this.invalidateSession(request);
          throw new UnauthorizedException('Person token invalid, terminating session.');
        }

        throw new InternalServerErrorException('Error validating user personToken.', err.message);
      }),
    );
  }

  public invalidateSession(request) {
    request.logout((err) => {
      request.session.cookie.maxAge = 0;
    });

    request.session.cookie.maxAge = 0;
  };
}

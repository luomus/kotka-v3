import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationService } from './authentication.service';

@Injectable()
export class LajiAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthenticationService
  ) {
    super()
  }

  async validate(req: Request, done: any) {
    //for initial testing only, to be replaced with colls to laji-api and laji-store to get proepr user information and kotka role
    done(null, {
      id: 1111111111
    })
  }
}
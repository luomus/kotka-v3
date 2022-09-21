import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthenticationService } from './authentication.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class LajiAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthenticationService
  ) {
    super();
  }

  async validate(req: Request, done: any) {
    const user = await lastValueFrom(this.authService.getProfile(req.body.token));
    done(null, user);
  }
}
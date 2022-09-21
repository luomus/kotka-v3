import { Controller, Get, Post, Redirect, Req, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from './authenticateCookie.guard';
import { AuthenticatePersonTokenGuard } from './authenticatePersonToken.guard';
import { AuthenticationService } from './authentication.service';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService
  ) {}

  @Get()
  @UseGuards(AuthenticateCookieGuard)
  getAll() {
    return 'test';
  }

  @Get('login')
  @Redirect()
  getLoginPage() {
    return {
      url: this.authService.getLoginUrl(),
      code: 302
    };
  }

  @Post('login')
  @UseGuards(AuthenticatePersonTokenGuard)
  loginUser(@Req() request) {
    return request.user?.profile;
  }

  @UseGuards(AuthenticateCookieGuard)
  @Get('logout')
  async logoutUser(@Req() request) {
    if (request.user) {
      await lastValueFrom(this.authService.logoutUser(request.user.personToken));
    }
  
    request.logout((err) => {
      request.session.cookie.maxAge = 0;
    });

    request.session.cookie.maxAge = 0;
  }

  @UseGuards(AuthenticateCookieGuard)
  @Get('user')
  async getUser(@Req() request) {
    if (request.user?.personToken) {
      const user = await lastValueFrom(this.authService.checkLoginValidity(request.user.personToken));

      if (user) {
        return request.user.profile;
      }
    }

    return null;
  }
}

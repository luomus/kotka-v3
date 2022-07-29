import { Controller, Get, Next, Post, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { request } from 'http';
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
    return 'test'
  }

  @Get('login')
  @Redirect()
  getLoginPage() {
    return {
      url: this.authService.getLoginUrl(),
      code: 302
    }
  }

  @Post('login')
  @UseGuards(AuthenticatePersonTokenGuard)
  loginUser(@Req() request) {
    return request.user;
  }

  @Get('logout')
  logoutUser(@Req() request) {
    request.logout((err) => {
      request.session.cookie.maxAge = 0;
    });
  }

  @Get('user')
  getUser(@Req() request) {
    return request.user;
  }
}

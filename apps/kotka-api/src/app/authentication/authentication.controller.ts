import { Controller, Get, InternalServerErrorException, Post, Query, Redirect, Req, UseFilters, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { AuthenticateCookieGuard } from './authenticateCookie.guard';
import { AuthenticatePersonTokenGuard } from './authenticatePersonToken.guard';
import { AuthenticationService } from './authentication.service';
import { LoginExceptionsFilter } from './loginExceptions.filter';

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
  getLoginPage(@Query('next') next = '') {
    return {
      url: this.authService.getLoginUrl(next),
      code: 302,
    };
  }

  @Post('login')
  @UseGuards(AuthenticatePersonTokenGuard)
  @UseFilters(LoginExceptionsFilter)
  @Redirect()
  loginUser(@Req() request) {
    return { url: `/user/login?next=${request.user.next}` };
  }

  @Get('postLogin')
  @UseGuards(AuthenticateCookieGuard)
  postLoginUser(@Req() request) {
    return {
      profile: request.user.profile,
      next: request.user.next
    };
 }

  @UseGuards(AuthenticateCookieGuard)
  @Get('logout')
  async logoutUser(@Req() request) {
    await lastValueFrom(this.authService.logoutUser(request));
  }

  @UseGuards(AuthenticateCookieGuard)
  @Get('user')
  async getUser(@Req() request) {
    if (request.user?.personToken) {
      const user = await lastValueFrom(this.authService.checkLoginValidity(request));

      if (user) {
        return request.user.profile;
      }
    }

    this.authService.invalidateSession(request);
    throw new InternalServerErrorException('No person token attached to session, closing session.');
  }
}

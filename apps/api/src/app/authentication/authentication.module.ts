import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthenticateCookieGuard } from './authenticateCookie.guard';
import { AuthenticatePersonTokenGuard } from './authenticatePersonToken.guard';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { CustomSerializer } from './custom.serializer';
import { LajiAuthStrategy } from './laji-auth.strategy';

@Module({
    imports: [HttpModule],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, CustomSerializer, AuthenticatePersonTokenGuard, AuthenticateCookieGuard, LajiAuthStrategy],
    exports: [AuthenticatePersonTokenGuard]
})
export class AuthenticationModule {}

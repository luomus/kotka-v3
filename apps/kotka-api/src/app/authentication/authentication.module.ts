import { Module } from '@nestjs/common';
import { ApiServicesModule } from '@kotka/api-services';
import { AuthenticateCookieGuard } from './authenticateCookie.guard';
import { AuthenticatePersonTokenGuard } from './authenticatePersonToken.guard';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { CustomSerializer } from './custom.serializer';
import { LajiAuthStrategy } from './laji-auth.strategy';

@Module({
    imports: [
      ApiServicesModule,
    ],
    controllers: [
      AuthenticationController
    ],
    providers: [
      AuthenticationService,
      CustomSerializer,
      AuthenticatePersonTokenGuard,
      AuthenticateCookieGuard,
      LajiAuthStrategy
    ],
    exports: [
      AuthenticatePersonTokenGuard
    ]
})
export class AuthenticationModule {}

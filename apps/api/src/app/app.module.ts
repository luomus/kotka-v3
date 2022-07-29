import { AuthenticationModule } from './authentication/authentication.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [AuthenticationModule, HttpModule],
  controllers: [AppController],
  providers: [ AppService]
})
export class AppModule {}

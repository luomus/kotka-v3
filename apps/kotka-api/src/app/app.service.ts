import { Injectable } from '@nestjs/common';
import { Message } from '@kotka/api-interfaces';

@Injectable()
export class AppService {
  getData(): Message {
    return { message: 'Welcome to kotka-api!' };
  }
}
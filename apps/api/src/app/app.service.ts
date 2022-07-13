import { Injectable } from '@nestjs/common';
import { Message } from '@kotka-v3/api-interfaces';

@Injectable()
export class AppService {
  getData(): Message {
    return { message: 'Welcome to api!' };
  }
}

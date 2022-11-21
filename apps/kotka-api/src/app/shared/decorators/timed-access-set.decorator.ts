/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { SetMetadata } from '@nestjs/common';

interface TimedAccessMetadata {
  get?: {[key: string]: number},
  post?: {[key: string]: number},
  put?: {[key: string]: number},
  delete?: {[key: string]: number}
};

export const TimedAccessSet = (data: TimedAccessMetadata) => SetMetadata('timedAccessMetadata', data);

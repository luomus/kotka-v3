/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { SetMetadata } from '@nestjs/common';

export const ControllerType = (type: string) => SetMetadata('controllerType', type);
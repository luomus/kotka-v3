/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { SetMetadata } from '@nestjs/common';
import { KotkaObjectFullType } from '@kotka/shared/models';

export const ControllerType = (type: KotkaObjectFullType) => SetMetadata('controllerType', type);

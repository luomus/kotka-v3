/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { SetMetadata } from '@nestjs/common';
import { KotkaDocumentObjectFullType } from '@kotka/shared/models';

export const ControllerType = (type: KotkaDocumentObjectFullType) => SetMetadata('controllerType', type);

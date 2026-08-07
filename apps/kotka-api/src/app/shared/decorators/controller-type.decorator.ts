/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { SetMetadata } from '@nestjs/common';
import { KotkaDocumentFullType } from '@kotka/shared/models';

export const ControllerType = (type: KotkaDocumentFullType) => SetMetadata('controllerType', type);

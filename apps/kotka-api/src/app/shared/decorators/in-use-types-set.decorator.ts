/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { SetMetadata } from '@nestjs/common';

export const InUseTypesSet = (types: string[]) => SetMetadata('inUseTypes', types);

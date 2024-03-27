/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { SetMetadata } from '@nestjs/common';

export const NonOrgPropertyFilter = (props: string[]) => SetMetadata('nonOrgFilteredProperties', props);
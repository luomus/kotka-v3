/*
https://docs.nestjs.com/openapi/decorators#decorators
*/

import { KeyOfUnion, StoreObject } from '@luomus/laji-schema/models';
import { SetMetadata } from '@nestjs/common';

export const IntellectualOwnerMedia = (props: { [key in KeyOfUnion<StoreObject>]: 'pdf' | 'image' }) => SetMetadata('intellectualOwnerMedia', props);
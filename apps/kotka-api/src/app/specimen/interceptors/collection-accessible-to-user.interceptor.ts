import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Collection, Document } from '@kotka/shared/models';
import { Observable } from 'rxjs';
import { JSONPath } from 'jsonpath-plus';
import { isAdmin } from '@kotka/shared/utils';
import { getError } from '@kotka/api/services';
import { OldKotkaDataService } from '../../shared/services/old-kotka-data.service';

const collectionIDPath = '/collectionID';
const sampleCollectionIDPath = '/gatherings/*/units/*/samples/*/collectionID';

@Injectable()
export class CollectionAccessibleToUserInterceptor implements NestInterceptor {
  constructor(
    private readonly oldKotkaDataService: OldKotkaDataService
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    if (!((req.method === 'POST' && context.getHandler().name !== 'search') || req.method === 'PUT')) {
      return next.handle();
    }

    const profile = req.user?.profile;
    const body: Document = req.body;

    if (!profile) {
      throw new HttpException(getError('/', 'User profile not found in request'), 500);
    }

    if (!profile.organisation || profile.organisation.length === 0) {
      throw new HttpException(getError('/', 'User does not belong to any organisations'), 500);
    }


    if (!body.collectionID) {
      throw new HttpException(getError(collectionIDPath, 'CollectionID is required field'), 422);
    }

    if (isAdmin(profile)) {
      return next.handle();
    }

    const collections: Record<string, string> = { [collectionIDPath]: body.collectionID };

    JSONPath({ json: body, path: sampleCollectionIDPath.split('/'), resultType: 'all', wrap: true }).forEach((value: any) => {
      collections[value.pointer] = value.value;
    });

    const errors: Record<string, string[]> = {};
    let foundErrors = false;

    const values = Object.values(collections).filter((value, index, arr) => arr.indexOf(value) === index);

    let collectionData: Collection[] = [];

    try {
      collectionData = await this.oldKotkaDataService.getCollections(values);
    } catch (e) {
      throw new HttpException(getError('/', 'Error fetching collection data to check user access rights: ' + e.message), 500);
    }

    for (const [pointer, collectionID] of Object.entries(collections)) {
      const collection = collectionData.find(coll => coll.id === collectionID);

      if (!collection) {
        foundErrors = true;
        errors[pointer] = [`Collection with ID ${collectionID} not found`];
        continue;
      }

      if (!profile.organisation.includes(collection.owner)) {
        foundErrors = true;
        errors[pointer] = [`User does not have access to collection ${collectionID}`];
      }
    }

    if (foundErrors) {
      throw new HttpException({ errorCode: 'VALIDATION_EXCEPTION', details: errors }, 422);
    }

    return next.handle();
  }
}
